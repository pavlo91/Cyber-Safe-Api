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
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
    region: process.env.STORAGE_REGION ?? 'us-east-1',
    bucketUpload: process.env.STORAGE_BUCKET_UPLOAD ?? 'cybersafely-develop',
    bucketMedia: process.env.STORAGE_BUCKET_MEDIA ?? 'cybersafely-develop-postdata',
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
  comprehend: {
    accessKey: process.env.COMPREHEND_ACCESS_KEY,
    secretKey: process.env.COMPREHEND_SECRET_KEY,
    region: process.env.COMPREHEND_REGION ?? 'us-east-1',
  },
  rekognition: {
    accessKey: process.env.REKOGNITION_ACCESS_KEY,
    secretKey: process.env.REKOGNITION_SECRET_KEY,
    region: process.env.REKOGNITION_REGION ?? 'us-east-1',
    labels: process.env.REKOGNITION_LABELS?.split(',') ?? [],
  },
}
