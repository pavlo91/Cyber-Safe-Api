export const config = {
  dev: process.env.NODE_ENV !== 'production',
  port: parseInt(process.env.PORT ?? '3001'),
  secret: process.env.SECRET ?? 'secret',
  apiURL: process.env.API_URL ?? 'http://localhost:3001',
  webURL: process.env.WEB_URL ?? 'http://localhost:3000',
  enableCronJobs: process.env.ENABLE_CRON_JOBS === 'true',
  postmark: {
    token: process.env.POSTMARK_TOKEN,
    from: process.env.POSTMARK_FROM,
  },
  storage: {
    credentials: process.env.STORAGE_CREDENTIALS ? (JSON.parse(process.env.STORAGE_CREDENTIALS) as object) : undefined,
    uploadBucket: process.env.STORAGE_UPLOAD_BUCKET,
    dataBucket: process.env.STORAGE_DATA_BUCKET,
  },
  template: {
    appName: process.env.TEMPLATE_APP_NAME ?? 'CyberSafely.ai – Social Media Pivot',
    webURL: process.env.WEB_URL ?? 'http://localhost:3000',
  },
  email: {
    contact: process.env.EMAIL_CONTACT ?? 'annettef@cybersafely.ai',
  },
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
  },
}
