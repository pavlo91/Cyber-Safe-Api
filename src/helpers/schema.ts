import Ajv from "ajv";
import { DocumentNode } from "graphql";
import logger from "../libs/logger";

const ajv = new Ajv().addFormat("isodate", (value: any) => !isNaN(new Date(value).getTime()));

const registeredTypes: { [name: string]: any } = {};
const typeMap: { [name: string]: string } = {
  String: "string",
  Boolean: "boolean",
  Int: "integer",
  Float: "number",
  ID: "integer"
};

function extractType(obj: any): any {
  if (obj.kind === "NamedType") {
    let newObj: any = {};

    const value = obj.name.value;

    if (value === "DateTime") {
      newObj.type = ["string", "null"];
      newObj.format = "isodate";
    } else {
      if (!typeMap[value] && !registeredTypes[value]) {
        throw new Error(`Unknown type "${value}"`);
      }

      const parsedValue = typeMap[value] || registeredTypes[value];

      if (parsedValue instanceof Object) {
        if (parsedValue.enum) {
          newObj = { ...newObj, ...parsedValue };
        } else {
          newObj.type = ["object", "null"];
          newObj.additionalProperties = true;
          newObj.properties = parsedValue;
          newObj.required = Object.keys(parsedValue).filter(key => !parsedValue[key].type.includes("null"));
        }
      } else {
        newObj.type = [parsedValue, "null"];
      }
    }

    return newObj;
  } else if (obj.kind === "NonNullType") {
    const newObj = extractType(obj.type);
    newObj.type = newObj.type.filter((t: any) => t !== "null");

    return newObj;
  } else if (obj.kind === "ListType") {
    const newObj = {
      type: ["array", "null"],
      items: extractType(obj.type)
    };

    return newObj;
  }

  return obj;
}

export function gqlToSchema(typeDefs: DocumentNode): any {
  const routes: {
    [method: string]: {
      body?: any;
      result?: any;
    };
  } = {};

  for (let definition of typeDefs.definitions) {
    if (definition.kind === "ObjectTypeDefinition" || definition.kind === "InputObjectTypeDefinition") {
      const objType = definition.name.value;
      const obj: { [name: string]: any } = {};

      if (!definition.fields) {
        return {};
      }

      for (let field of definition.fields) {
        const name = field.name.value;
        const parsedValue = extractType(field.type);
        obj[name] = parsedValue;
      }

      registeredTypes[objType] = obj;
    } else if (definition.kind === "EnumTypeDefinition") {
      if (!definition.values) {
        continue;
      }

      registeredTypes[definition.name.value] = {
        type: ["string", "null"],
        enum: definition.values.map(v => v.name.value)
      };
    } else if (definition.kind === "ObjectTypeExtension" && ["Mutation", "Query"].includes(definition.name.value)) {
      if (!definition.fields) {
        return {};
      }

      for (let route of definition.fields) {
        const method = route.name.value;

        const params =
          route.arguments && route.arguments.length > 0
            ? route.arguments
                .map(arg => ({
                  [arg.name.value]: extractType(arg.type)
                }))
                .reduce((a, b) => ({ ...a, ...b }))
            : {};

        routes[method] = {
          body: {
            type: ["object"],
            properties: params,
            additionalProperties: true,
            required: Object.keys(params).filter(key => !params[key].type.includes("null"))
          },
          result: extractType(route.type)
        };
      }
    } else {
      logger.warn(`Unknown GQL definition "${definition.kind}"`);
    }
  }

  return routes;
}

export function buildBodySchemaValidator(schema: any) {
  return ajv.compile(schema);
}
