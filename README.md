# cybersafely-api

## Environment Variables

```bash
DATABASE_URL=
ENVIRONMENT= # production/development/demo
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
AZURE_SMS_CONNECTION_STRING=
AZURE_SMS_FROM=
```

## Seeded Logins

- `staff@cybersafely.ai`
- `admin@cybersafely.ai`
- `coach@cybersafely.ai`
- `student@cybersafely.ai`
- `parent@cybersafely.ai`

The password for all is `password`.

## Socials

### 1. Twitter

- ✅ Supports login via OAuth2
- ✅ Refresh tokens via cron jobs
- ❌ No webhooks, using cron jobs
- ❌ No paging implemented while getting posts, gets the newest max 50 since the indexed date
- ✅ Supports deleting posts

Also there is a bug in the Twitter mobile app that does not allow redirecting to the callback url. Because of this, logging in from a mobile browser with Twitter mobile app installed will not work correctly (https://twittercommunity.com/t/web-oauth-2-0-is-broken-on-android-if-twitter-app-is-installed/169698).

### 2. Facebook

- ✅ Supports login via OAuth2
- ✅ Refresh tokens via cron jobs
- ❌ No webhooks, using cron jobs
- ❌ No paging implemented while getting posts, gets the newest max 50 since the indexed date
- ❌ No support for deleting posts ([link](https://developers.facebook.com/docs/graph-api/reference/v17.0/user/posts))


### 3. Instagram

- ✅ Supports login via OAuth2
- ✅ Refresh tokens via cron jobs
- ❌ No webhooks, using cron jobs
- ❌ No paging implemented while getting posts, gets the newest max 50 since the indexed date
- ❌ No support for deleting posts ([link](https://developers.facebook.com/docs/instagram-api/reference/ig-media))

### 4. TikTok

- ✅ Supports login via OAuth2
- ✅ Refresh tokens via cron jobs
- ℹ️ Supports webhooks but using cron jobs for now ([link](https://developers.tiktok.com/doc/webhooks-overview/))
- ❌ No support for deleting posts
- ❌ No paging implemented while getting posts, gets the newest max 20 since the indexed date

THe developer platform does not support setting a `localhost` redirect url. In this case you can set `TIKTOK_CALLBACK_URL=https://api.develop.cybersafely.ai/oauth2/tiktok` as an env var that will redirect to this url instead and you can then replace the base to `localhost`.
