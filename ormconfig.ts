import config from "./src/config";

export = {
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

  entities: ["./src/entities/*.ts"],
  migrations: ["./src/migrations/*.ts"],
  cli: {
    entitiesDir: "./src/entities",
    migrationsDir: "./src/migrations"
  }
};
