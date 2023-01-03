import { gql } from "apollo-server-express";

import { authenticated, withUser } from "../helpers/middleware";
import User from "../entities/user";
import Address from "../entities/address";

export const typeDefs = gql`
  enum UserType {
    GENERIC
    ADMIN
  }

  type Address {
    id: ID!
    addressLine1: String!
    addressLine2: String
    addressLine3: String
    city: String!
    state: String
    country: String!
    zipcode: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type UserNotificationSettings {
    email: Boolean
    phone: Boolean
  }

  type UserSettings {
    notifications: UserNotificationSettings
  }

  input AddressInfo {
    addressLine1: String!
    addressLine2: String
    addressLine3: String
    city: String!
    state: String
    country: String!
    zipcode: String!
  }

  type User {
    id: ID!
    type: UserType!
    firstName: String!
    lastName: String!
    fullName: String!
    birthday: DateTime
    email: String!
    phone: String
    address: Address!
    settings: UserSettings!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input ProfileInfo {
    firstName: String
    lastName: String
    birthday: DateTime
    phone: String
    address: AddressInfo
    settings: SettingsInfo
  }

  extend type Query {
    me: User
    user(id: ID!): User
    users: [User!]!
  }

  extend type Mutation {
    updateProfile(info: ProfileInfo!): Boolean
  }
`;

export const resolvers: IResolver = {
  Query: {
    me: withUser((_parent, _args, { user }) => {
      return user;
    }),
    user: authenticated(async (_parent, { id }, { connection }) => {
      return await connection.manager.findOne(User, { id });
    }),
    users: authenticated(async (_parent, _args, { connection }) => {
      return await connection.manager.find(User);
    })
  },
  Mutation: {
    updateProfile: authenticated(async (_parent, { info }, { connection, user }) => {
      if ("firstName" in info) user.firstName = info.firstName;
      if ("lastName" in info) user.lastName = info.lastName;
      if ("birthday" in info) user.birthday = info.birthday;
      if ("phone" in info) user.phone = info.phone;
      if ("settings" in info) user.settings = info.settings;

      if ("address" in info)
        user.address = await connection.manager.save(connection.manager.merge(Address, user.address, info.address));

      await connection.manager.save(user);
    })
  }
};
