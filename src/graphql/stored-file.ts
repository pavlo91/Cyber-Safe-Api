import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type StoredFile {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    mimeType: String!
    originalName: String!
    url: String!
  }
`;

export const resolvers: IResolver = {
  Query: {},
  Mutation: {}
};
