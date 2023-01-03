import config from "../config";
import express from "express";
import { ApolloServer, ApolloError, ValidationError } from "apollo-server-express";

import logger from "../libs/logger";
import { createInternalServerError } from "./errors";

const isProd = config.env === "production";

export function bindApolloServer(
  expressServer: express.Express,
  modules: any[],
  getContext: ({ req }: { req: express.Request }) => Object
) {
  const typeDefs = [];
  const resolvers = [];

  for (let path of modules) {
    const module = require(path);
    module.typeDefs && typeDefs.push(module.typeDefs);
    module.resolvers && resolvers.push(module.resolvers);
  }

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: getContext,
    formatError: (error: any) => {
      if (error.originalError instanceof ApolloError || error.originalError instanceof ValidationError) {
        return error;
      }

      const ticketNumber = new Date().valueOf();
      const customError = createInternalServerError(ticketNumber);

      const printError = error;
      logger.error("#%d: %s", ticketNumber, printError);

      return customError;
    },
    playground: !isProd
  });

  apolloServer.applyMiddleware({ app: expressServer, path: "/graphql" });
}

/*
  Example usage in main file:

  bindApolloServer(
    expressServer,
    routes,
    ({ req }: { req: express.Request }) => ({ connection, req })
  );
*/
