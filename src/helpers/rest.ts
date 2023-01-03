import express from "express";
import typeorm from "typeorm";
import path from "path";
import schemaFilter from "uber-json-schema-filter";

import logger from "../libs/logger";
import User from "../entities/user";
import { HTTPError } from "./errors";
import { buildBodySchemaValidator, gqlToSchema } from "./schema";

type ContextItems = {
  connection: typeorm.Connection;
  req: express.Request;
  user?: User;
};

type ContextFunc = ({ req }: { req: express.Request }) => ContextItems;
type HandlerFunc = (params: any, body: any, context: ContextItems) => any | Promise<any>;

// What a module should support
type FoundModule = {
  typeDefs?: any;
  resolvers?: {
    Query?: {
      [operation in CRUD]: HandlerFunc;
    };
    Mutation?: {
      [operation in CRUD]: HandlerFunc;
    };
  };
};

// Supported operations
const ops = {
  get: null,
  post: null,
  patch: null,
  put: null
};
type CRUD = keyof typeof ops;
const operations: CRUD[] = Object.keys(ops) as CRUD[];

function createRoutes(httpRoute: string, module: FoundModule, getContext: ContextFunc): Object[] {
  const routes = [];

  if (!module.resolvers || !module.typeDefs) {
    logger.warn(`Skipping route ${httpRoute}, resolvers or typeDefs exported`);
    return [];
  }

  const resolvers: any = { ...module.resolvers.Query, ...module.resolvers.Mutation };

  // Take the raw GQL typeDefs and convert them over to AJV schemas indexed by CRUD operations
  const parsedTypes = gqlToSchema(module.typeDefs);

  for (let operation of operations) {
    const handlerFunc = resolvers[operation];
    const operationSchema = parsedTypes[operation];

    if (!handlerFunc || !operationSchema) {
      continue;
    }

    // Compiling the schema validator is faster than if we do it at request time, so its pulled out to here
    const bodyValidator = buildBodySchemaValidator(operationSchema.body);
    const resultValidator = buildBodySchemaValidator(operationSchema.result);
    const resultFilter = (result: any) => schemaFilter(operationSchema.result, result);

    logger.verbose(`Adding route: ${operation.toUpperCase()} ${httpRoute}`);

    routes.push({
      path: httpRoute,
      method: operation,
      handler: async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
        let result: any = {};
        try {
          if (!bodyValidator(req.body)) {
            // @ts-ignore
            logger.error(`Body validation error: ${bodyValidator?.errors?.map(err => err.message).join(",")}`);
            // console.log(bodyValidator?.errors);
            throw new HTTPError(400, "Invalid request body");
          }
          result = handlerFunc(req.params, req.body, getContext({ req }));
          if (result instanceof Promise) {
            result = await result;
          }

          // Convert nested items like `Date`'s to strings (hack as fuck, replace this) and filter the object down
          result = JSON.parse(JSON.stringify(result));

          if (!resultValidator(result)) {
            // @ts-ignore
            logger.error(`Result validation error: ${resultValidator?.errors?.map(err => err.message).join(",")}`);
            console.log("resultValidator?.errors", resultValidator?.errors);
            // console.log(JSON.stringify(translatedResultSchema, null, 2));
            throw new HTTPError(400, "Invalid response body");
          }

          result = resultFilter(result);
        } catch (err) {
          let statusCode = 500;
          let message = "Internal server error";

          // TODO: Allow returning number directly and automatically source error message?
          // Example: `return 404` would essentially work like `throw new HTTPError(404, "Invalid body")`
          if (err instanceof HTTPError) {
            statusCode = err.statusCode;
            message = err.message;
          } else {
            logger.error(err.message);
          }

          return res
            .status(statusCode)
            .json({
              error: {
                code: statusCode,
                message: message
              }
            })
            .end();
        }

        res
          .status(200)
          .json(result || {})
          .end();
      }
    });
  }

  return routes;
}

export function bindRESTRoutes(
  basePath: string,
  expressServer: express.Express,
  modules: string[],
  getContext: ContextFunc
) {
  const routes = [];
  const noTypes = [];

  for (let foundPath of modules) {
    // Files export a function for each crud operation they want to bind to, as well as `typeDefs` to validate any of the body
    const module: FoundModule = require(foundPath);

    // Parse the path from a system file path to an http route
    const parsedPath = path.parse(foundPath.slice(basePath.length));
    const httpRoute = path
      .join(parsedPath.dir, parsedPath.name === "index" ? "" : parsedPath.name)
      .replace(/\[(\w+)\]/g, ":$1");

    try {
      const foundRoutes = createRoutes(httpRoute, module, getContext);
      for (let route of foundRoutes) {
        routes.push(route);
      }
    } catch (err) {
      if (/Unknown type/.test(err.message)) {
        noTypes.push({
          path: httpRoute,
          module: module
        });
      } else {
        throw err;
      }
    }
  }

  let typeProgress = true; // Were new types able to be resolved
  while (typeProgress) {
    typeProgress = false;

    for (let i = noTypes.length - 1; i >= 0; i--) {
      const route = noTypes[i];

      try {
        const foundRoutes = createRoutes(route.path, route.module, getContext);
        for (let route of foundRoutes) {
          routes.push(route);
        }
        typeProgress = true;
        noTypes.splice(i, 1);
      } catch (err) {
        continue;
      }
    }
  }

  if (noTypes.length > 0) {
    createRoutes(noTypes[0].path, noTypes[0].module, getContext);
  }

  for (let route of routes) {
    // @ts-ignore
    expressServer[route.method](route.path, route.handler);
  }

  logger.verbose(`Added ${routes.length} route${routes.length === 1 ? "" : "s"}`);
}

/*
  Example usage:

  bindRESTRoutes(path.resolve(__dirname, "./routes"), expressServer, routes, ({ req }: { req: express.Request }) => ({
    connection,
    req
  }));
*/
