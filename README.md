# Boilerplate API

The idea of this repo is to be quickly deployed as a functioning API with full auth, file upload, and other common features. All while being easily extendable allowing addition of specific client/internal features.

### Requirements

- Node v12.x
- PostgreSQL
- Yarn v1.x

### Installation Setup

Install project dependencies:

```bash
yarn
```

Add a `.env` file to the root and configure it with your database information with the variables below:

```bash
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=
STORAGE_CONNECTION_STRING=
APP_URL=
```

Run available migrations:

```bash
yarn migrate
```

Run the application:

```bash
yarn dev
```

### Build

Build the project:

```bash
yarn build
```

Run the build:

```bash
yarn start
```

### Migrations

Create migrations:

```bash
yarn makemigrations <migration_name>
```

Perform migrations:

```bash
yarn migrate
```

### Configuration

All configuration is handled in `src/config.ts`. View this file to see the available environment variables.
