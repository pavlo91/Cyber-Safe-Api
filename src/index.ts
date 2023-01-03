import "reflect-metadata";

import { createConnection } from "typeorm";
import bodyParser from "body-parser";
import express from "express";
import glob from "glob";
import path from "path";

import { bindApolloServer } from "./helpers/apollo";
import config from "./config";
import logger from "./libs/logger";

const app = async () => {
  const connection = await createConnection({
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

    entities: [path.resolve(__dirname, "./entities/**/*.{ts,js}")],
    migrations: [path.resolve(__dirname, "./migrations/**/*.{ts,js}")],
    subscribers: [path.resolve(__dirname, "./subscribers/**/*.{ts,js}")]
  });

  const routes = glob.sync(path.resolve(__dirname, "./graphql/**/*.{ts,js}"));
  const expressServer = express();

  // Apply JSON body parser
  expressServer.use(bodyParser.json());
  expressServer.use(bodyParser.urlencoded({ extended: true }));

  // Serve static directory for files (styling, etc)
  expressServer.use(express.static(path.resolve("./public")));

  // Handle homepage routing
  expressServer.get("/", function (_req, res) {
    res.sendFile(path.resolve("./public/index.html"));
  });

  bindApolloServer(expressServer, routes, ({ req }: { req: express.Request }) => ({ connection, req }));

  expressServer.listen(config.port, () => logger.info("Server started on port %s", config.port));

  if (config.seed.enabled && config.seed.force) {
    await connection.dropDatabase();
  }

  try {
    await connection.runMigrations();
  } catch (err) {
    logger.error(`MIGRATION ERROR: ${err.message}`);
    if (err.query) {
      logger.info(`SQL: ${err.query}`);
    }
    const lastMigration = connection.migrations[connection.migrations.length - 1];
    if (lastMigration) {
      logger.info(`Last successful migration: ${lastMigration.name}`);
    }
    process.exit(1);
    return;
  }

  if (config.seed.enabled) {
    const seeds = glob.sync(path.resolve(__dirname, "./seed/**/*.{ts,js}"));

    logger.info(`Found %d seeder${seeds.length === 1 ? "" : "s"}...`, seeds.length);

    for (let path of seeds) {
      let run = true;

      const { seed, type } = require(path);
      if (!type) {
        logger.verbose(`Seed "${path}" doesn't export a DB type, continuing with seed`);
      } else if ((await connection.manager.count(type)) > 0) {
        logger.verbose(`${type.name} count greater than 0, skipping seed`);
        run = false;
      }

      if (run) {
        logger.info("Running seed at path: %s...", path);
        await seed(connection, logger);
      }
    }
  }

  const cronJobs = glob.sync(path.resolve(__dirname, "./cronjobs/**/*.{ts,js}"));

  logger.info(`Found %d cron job${cronJobs.length === 1 ? "" : "s"}...`, cronJobs.length);

  for (let path of cronJobs) {
    logger.info("Running cron job at path: %s...", path);

    const cronJob = require(path);

    for (let func of Object.values(cronJob)) {
      if (typeof func === "function") {
        await func(connection);
      }
    }
  }
};

app().catch(error => {
  logger.error(error.stack);
});
