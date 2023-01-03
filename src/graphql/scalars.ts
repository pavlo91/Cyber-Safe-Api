import { Kind, ValueNode } from "graphql";
import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar DateTime
`;

export const resolvers: IResolver = {
  DateTime: {
    serialize(value: any) {
      return new Date(value).toISOString();
    },
    parseValue(value: any) {
      return new Date(value);
    },
    parseLiteral(ast: ValueNode) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value);
      } else if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }

      return null;
    }
  }
};
