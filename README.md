# cybersafely-api

## Environment Variables

```bash
DATABASE_URL=
ENVIRONMENT=
PORT=
SECRET=
API_URL=
WEB_URL=
ENABLE_CRON_JOBS=
CONTACT_EMAIL=
TEMPLATE_APP_NAME=
POSTMARK_TOKEN=
POSTMARK_FROM=
AMAZON_STORAGE_ACCESS_KEY=
AMAZON_STORAGE_SECRET_KEY=
AMAZON_STORAGE_REGION=
AMAZON_STORAGE_PUBLIC_BUCKET=
AMAZON_STORAGE_PRIVATE_BUCKET=
AMAZON_MODERATOR_ACCESS_KEY=
AMAZON_MODERATOR_SECRET_KEY=
AMAZON_MODERATOR_REGION=
AMAZON_MODERATOR_LABELS=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
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

Also there is a bug in the Twitter mobile app that does not allow redirecting to the callback url. Because of this, logging in from a mobile browser with Twitter mobile app installed will not work correctly (https://twittercommunity.com/t/web-oauth-2-0-is-broken-on-android-if-twitter-app-is-installed/169698).

### 2. Facebook

For authenticating the user we save the access token. We will check in a cron job and refresh the almost expiring tokens.

Facebook does not support webhooks for when the user creates a post, so instead we are using a cron job everyday. Also it [does not support deleting a user post](https://developers.facebook.com/docs/graph-api/reference/v16.0/user/posts).

### 3. Instagram

### 4. TikTok
