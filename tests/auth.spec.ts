import "jest";
import * as path from "path";
import config from "../src/config";
import { createConnection, Connection } from "typeorm";

import { resolvers } from "../src/graphql/auth";
import User, { UserStatus } from "../src/entities/user";

const defaultUserCredentials = {
  email: "test@wonderkiln.com",
  firstName: "Staff",
  lastName: "Account",
  birthday: new Date(),
  phone: "555-555-5555",
  settings: {
    notifications: {
      phone: false,
      email: false
    }
  },
  password: "$2b$10$C0vY8ExDaGE4Ae/aaC3Y2uuPF.GytYevk0FcQdNlyqXnDLVofBGxe" // "password"
};

describe("Authentication", () => {
  let connection: Connection;

  beforeAll(async () => {
    if (!config.database.testDatabase || config.env !== "test") {
      console.log("Test database or environment not enabled! Exiting to preserve database.");
      process.exit(1);
    }

    connection = await createConnection({
      type: "postgres",

      ...(config.database.url
        ? {
            url: config.database.url
          }
        : {
            host: config.database.host,
            port: config.database.port,
            username: config.database.username,
            password: config.database.password,
            database: config.database.database
          }),

      entities: [path.resolve(__dirname, "../src/entities/**/*.{ts,js}")],
      migrations: [path.resolve(__dirname, "../src/migrations/**/*.{ts,js}")],
      subscribers: [path.resolve(__dirname, "../src/subscribers/**/*.{ts,js}")]
    });
  });

  afterEach(async () => {
    for (let metadata of connection.entityMetadatas) {
      await connection.query(`TRUNCATE TABLE "${metadata.tableName}" CASCADE`);
    }
  });

  afterAll(async () => {
    await connection.close();
  });

  describe("Login", () => {
    // @ts-ignore
    const resolver = resolvers.Mutation.login;

    it("should allow valid credentials", async () => {
      const body = {
        credentials: {
          email: "test@wonderkiln.com",
          password: "password"
        }
      };
      await connection.manager.save([new User(defaultUserCredentials)]);

      await expect(resolver(null, body, { connection })).resolves.toMatchObject({
        jwt: {
          token: expect.any(String),
          expiresAt: expect.any(Date)
        }
      });
    });

    it("should deny an incorrect password", async () => {
      const body = {
        credentials: {
          email: "test@wonderkiln.com",
          password: "password1"
        }
      };
      await connection.manager.save([new User(defaultUserCredentials)]);

      await expect(resolver(null, body, { connection })).rejects.toThrow();
    });

    it("should deny if user doesnt exist", async () => {
      const body = {
        credentials: {
          email: "test@wonderkiln.com",
          password: "password"
        }
      };
      await connection.manager.save([
        new User({
          ...defaultUserCredentials,
          email: "not-test@wonderkiln.com" // Not actually "test@wonderkiln.com" like requested
        })
      ]);

      await expect(resolver(null, body, { connection })).rejects.toThrow();
    });

    it("should deny if user was deleted", async () => {
      const body = {
        credentials: {
          email: "test@wonderkiln.com",
          password: "password"
        }
      };
      await connection.manager.save([
        new User({
          ...defaultUserCredentials,
          status: UserStatus.Deleted
        })
      ]);

      await expect(resolver(null, body, { connection })).rejects.toThrow();
    });
  });

  describe("Registration", () => {
    // @ts-ignore
    const resolver = resolvers.Mutation.registerUser;

    it("should allow registration", async () => {
      const body = {
        profile: {
          email: "test@wonderkiln.com",
          password: "password",
          firstName: "Testy",
          lastName: "McTestFace",
          birthday: new Date(),
          phone: "555-555-5555",
          settings: {
            notifications: {
              phone: false,
              email: false
            }
          },
          address: {
            addressLine1: "123 Test St",
            city: "Akron",
            state: "OH",
            country: "US",
            zipcode: "55555"
          }
        }
      };

      await expect(resolver(null, body, { connection })).resolves.toMatchObject({
        jwt: {
          token: expect.any(String),
          expiresAt: expect.any(Date)
        }
      });
    });

    it("should deny registration if email is already used", async () => {
      const body = {
        profile: {
          email: "test@wonderkiln.com",
          password: "password1",
          firstName: "Testy",
          lastName: "McTestFace",
          birthday: new Date(),
          phone: "555-555-5555",
          settings: {
            notifications: {
              phone: false,
              email: false
            }
          },
          address: {
            addressLine1: "123 Test St",
            city: "Akron",
            state: "OH",
            country: "US",
            zipcode: "55555"
          }
        }
      };
      await connection.manager.save([new User(defaultUserCredentials)]);

      await expect(resolver(null, body, { connection })).rejects.toThrow();
    });
  });
});
