# cybersafely-api

## Environment Variables

```bash
DATABASE_URL=
NODE_ENV=
PORT=
SECRET=
API_URL=
WEB_URL=
ENABLE_CRON_JOBS=
POSTMARK_TOKEN=
POSTMARK_FROM=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_REGION=
STORAGE_BUCKET_UPLOAD=
STORAGE_BUCKET_MEDIA=
TEMPLATE_APP_NAME=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_BEARER_TOKEN=
COMPREHEND_ACCESS_KEY=
COMPREHEND_SECRET_KEY=
COMPREHEND_REGION=
REKOGNITION_ACCESS_KEY=
REKOGNITION_SECRET_KEY=
REKOGNITION_REGION=
REKOGNITION_LABELS=
```

## Seeded Logins

- `staff@wonderkiln.com`
- `admin@wonderkiln.com`
- `coach@wonderkiln.com`
- `student@wonderkiln.com`
- `parent@wonderkiln.com`

The password for all is `password`.

## Socials

### 1. Twitter

For authenticating the user we save the access token and the refresh token. We will check in a cron job and refresh the almost expiring tokens.

Twitter does not support webhooks for when the user creates a tweet, so instead we are using a cron job everyday.

### 2. Facebook

For authenticating the user we save the access token. We will check in a cron job and refresh the almost expiring tokens.

Facebook does not support webhooks for when the user creates a post, so instead we are using a cron job everyday. Also it [does not support deleting a user post](https://developers.facebook.com/docs/graph-api/reference/v16.0/user/posts).
