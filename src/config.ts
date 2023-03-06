export const config = {
  dev: process.env.NODE_ENV !== 'production',
  port: parseInt(process.env.PORT ?? '3001'),
  secret: process.env.SECRET ?? 'secret',
  apiURL: process.env.API_URL ?? 'http://localhost:3001',
  webURL: process.env.WEB_URL ?? 'http://localhost:3000',
  postmark: {
    token: process.env.POSTMARK_TOKEN,
    from: process.env.POSTMARK_FROM,
  },
  storage: {
    connectionString: process.env.STORAGE_CONNECTION_STRING,
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
  },
}
