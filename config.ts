import dotenv from 'dotenv'

dotenv.config()

const config = {
  dev: process.env.ENVIRONMENT !== 'production',
  demo: process.env.ENVIRONMENT === 'demo',
  port: parseInt(process.env.PORT ?? '3001'),
  secret: process.env.SECRET ?? 'secret',
  apiURL: process.env.API_URL ?? 'https://localhost:3001',
  webURL: process.env.WEB_URL ?? 'http://localhost:3000',
  enableCronJobs: process.env.ENABLE_CRON_JOBS === 'true',
  contactEmail: process.env.CONTACT_EMAIL,
  template: {
    appName: process.env.TEMPLATE_APP_NAME ?? 'CyberSafely.ai',
    apiURL: process.env.API_URL ?? 'http://localhost:3001',
    webURL: process.env.WEB_URL ?? 'http://localhost:3000',
  },
  postmark: {
    token: process.env.POSTMARK_TOKEN,
    from: process.env.POSTMARK_FROM,
  },
  azure: {
    sms: {
      connectionString: process.env.AZURE_SMS_CONNECTION_STRING,
      from: process.env.AZURE_SMS_FROM,
    },
  },
  amazon: {
    storage: {
      accessKey: process.env.AMAZON_STORAGE_ACCESS_KEY,
      secretKey: process.env.AMAZON_STORAGE_SECRET_KEY,
      region: process.env.AMAZON_STORAGE_REGION ?? 'us-east-1',
      publicBucket: process.env.AMAZON_STORAGE_PUBLIC_BUCKET ?? 'cybersafely-develop',
      privateBucket: process.env.AMAZON_STORAGE_PRIVATE_BUCKET ?? 'cybersafely-develop-postdata',
    },
    moderator: {
      accessKey: process.env.AMAZON_MODERATOR_ACCESS_KEY,
      secretKey: process.env.AMAZON_MODERATOR_SECRET_KEY,
      region: process.env.AMAZON_MODERATOR_REGION ?? 'us-east-1',
      labels: process.env.AMAZON_MODERATOR_LABELS?.split(',').map((e) => e.trim()) ?? [],
    },
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    callbackURL: '/oauth2/twitter',
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/oauth2/facebook',
  },
  instagram: {
    appId: process.env.INSTAGRAM_APP_ID,
    appSecret: process.env.INSTAGRAM_APP_SECRET,
    callbackURL: '/oauth2/instagram',
  },
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    callbackURL: '/oauth2/tiktok/',
  },
}

export default config
