import { merge } from "lodash";
import dotenv from "dotenv";
dotenv.config();

/**
 * Initial configuration
 */
const initial: any = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3001,
  secret: process.env.SECRET || "secret",
  appUrl: process.env.APP_URL,
  logger: {
    file: "./console.log",
    colorize: false
  },
  database: {
    url: process.env.DATABASE_URL || undefined,
    host: process.env.DATABASE_HOST || "localhost",
    port: process.env.DATABASE_PORT || 5432,
    username: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "boilerplate-api",
    testDatabase: process.env.DATABASE_TEST_ENV === "true"
  },
  stripe: {
    secret: process.env.STRIPE_SECRET,
    publishable: process.env.STRIPE_PUBLISHABLE,
    planId: process.env.STRIPE_PLAN_ID
  },
  storage: {
    container: process.env.STORAGE_CONTAINER || "uploads",
    connectionString: process.env.STORAGE_CONNECTION_STRING
  },
  mailgun: {
    key: process.env.MAILGUN_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    from: process.env.MAILGUN_FROM_ADDRESS
  },
  seed: {
    enabled: process.env.SEED_ENABLED === "true",
    force: process.env.SEED_FORCE === "true"
  }
};

/**
 * Environmental configuration overrides
 */
const overrides: any = {
  development: {
    logger: {
      colorize: true
    },
    seed: {
      enabled: true,
      force: false
    }
  },
  staging: {},
  production: {},
  test: {
    database: {
      database: "boilerplate-api-test",
      testDatabase: true
    }
  }
};

const env = process.env.NODE_ENV || "development";
const config = merge(initial, overrides[env] || {});

export default config;
