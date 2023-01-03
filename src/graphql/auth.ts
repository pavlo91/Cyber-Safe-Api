import { ApolloError, gql } from "apollo-server-express";

import config from "../config";
import Address from "../entities/address";
import User, { UserType, UserStatus } from "../entities/user";
import Org, { OrgLink } from "../entities/org";

import { generateTokenForUser } from "../helpers/jwt";
import { SendEmailArgs, sendEmail } from "../libs/email";
import { authenticated } from "../helpers/middleware";

export const typeDefs = gql`
  type JWT {
    token: String!
    expiresAt: DateTime!
  }

  type LoginResponse {
    jwt: JWT
    user: User
  }

  type RegisterResponse {
    jwt: JWT
    user: User
  }

  type NewPasswordResetResponse {
    noServerError: Boolean
  }

  type CompletePasswordResetResponse {
    noServerError: Boolean
  }

  input Credentials {
    email: String!
    password: String!
  }

  input NotificationSettingInfo {
    phone: Boolean
    email: Boolean
  }

  input SettingsInfo {
    notifications: NotificationSettingInfo
  }

  input PaymentInfo {
    paymentMethodId: String
  }

  input OrganizationContactInfo {
    fullName: String
    title: String
    email: String
    phone: String
  }

  input OrganizationInfo {
    name: String!
    address: AddressInfo!
    paymentInfo: PaymentInfo!
    contact: OrganizationContactInfo
  }

  input UserProfileInfo {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    birthday: String!
    address: AddressInfo!
    phone: String!
    settings: SettingsInfo
  }

  extend type Mutation {
    registerOrganization(profile: UserProfileInfo!, organization: OrganizationInfo!): RegisterResponse!
    registerUser(profile: UserProfileInfo!): LoginResponse!

    login(credentials: Credentials): LoginResponse!
    newPasswordReset(email: String): NewPasswordResetResponse
    completePasswordReset(password: String): CompletePasswordResetResponse
  }
`;

export const resolvers: IResolver = {
  Mutation: {
    async registerOrganization(_parent, { profile, organization }, { connection }) {
      if (await connection.manager.findOne(User, { email: profile.email })) {
        throw new ApolloError("There is already an account with that email");
      }

      return connection.manager.transaction(async manager => {
        const userAddress = await manager.save(manager.create(Address, profile.address));
        const orgAddress = await manager.save(manager.create(Address, organization.address));

        const org = await manager.save(
          manager.create(Org, {
            ...organization,
            address: orgAddress
          })
        );

        const newUser = manager.create(User, {
          ...profile,
          type: UserType.Admin,
          address: userAddress
        });
        await newUser.setPassword(profile.password);

        const user = await manager.save(newUser);

        await manager.save(
          manager.create(OrgLink, {
            org,
            user
          })
        );

        const jwt = generateTokenForUser(user);

        return { jwt, user };
      });
    },
    async registerUser(_parent, { profile }, { connection }) {
      if (await connection.manager.findOne(User, { email: profile.email })) {
        throw new ApolloError("There is already an account with that email");
      }

      return connection.manager.transaction(async manager => {
        const address = await manager.save(manager.create(Address, profile.address));

        const newUser = manager.create(User, {
          ...profile,
          address,
          type: UserType.Admin
        });
        await newUser.setPassword(profile.password);

        const user = await manager.save(newUser);
        const jwt = generateTokenForUser(user);

        return { jwt, user };
      });
    },
    async login(_parent, { credentials }, { connection }) {
      const email = credentials.email.toLowerCase();

      const user = await connection.manager.findOne(User, { email });
      if (!user) {
        throw new ApolloError("Invalid Login");
      }

      if (!(await user.isPassword(credentials.password))) {
        throw new ApolloError("Invalid Login");
      }

      if (user.status === UserStatus.Deleted) {
        throw new ApolloError("Invalid user");
      }

      const jwt = generateTokenForUser(user);

      return { jwt, user };
    },
    async newPasswordReset(_parent, { email }, { connection }) {
      if (!email) {
        throw new ApolloError("Invalid Reset");
      }

      const user = await connection.manager.findOne(User, { email });

      if (user) {
        const message = "<p>Click the link below to complete your password reset.</p>";
        const jwt = generateTokenForUser(user);
        const resetUrl = `${config.appUrl}/forgot_password/reset?token=${jwt.token}`;
        const resetLink = `<a href="${resetUrl}">${resetUrl}</a>`;
        const args: SendEmailArgs = {
          to: user.email,
          subject: "Password Reset",
          body: `${message}\n${resetLink}`
        };
        sendEmail(args);
      }

      return {
        noServerError: true
      };
    },
    completePasswordReset: authenticated(async (_parent, { password }, { connection, user }) => {
      if (!password) {
        throw new ApolloError("Invalid Reset");
      }

      await user.setPassword(password);
      await connection.manager.save(user);

      return { noServerError: true };
    })
  }
};
