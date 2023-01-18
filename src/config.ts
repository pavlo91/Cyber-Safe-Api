type ComposeUrl = {
  apiUrl: string
  webUrl: string
}

function composeUrl(this: ComposeUrl, key: keyof ComposeUrl, path: string, query?: Record<string, any>) {
  const url = new URL(this[key])

  let pathname = path

  if (query) {
    Object.keys(query).forEach((key) => {
      const value = String(query[key])

      if (pathname.includes(':' + key)) {
        pathname = pathname.replace(':' + key, value)
      } else {
        url.searchParams.set(key, value)
      }
    })
  }

  url.pathname = pathname

  return url.toString()
}

export const Config = {
  composeUrl,
  dev: process.env.NODE_ENV !== 'production',
  port: parseInt(process.env.PORT ?? '3001'),
  secret: process.env.SECRET ?? 'secret',
  apiUrl: process.env.API_URL ?? 'http://localhost:3001',
  webUrl: process.env.WEB_URL ?? 'http://localhost:3000',
  jobExpression: process.env.JOB_EXPRESSION,
  logLevel: process.env.LOG_LEVEL,
  postmark: {
    token: process.env.POSTMARK_TOKEN,
    from: process.env.POSTMARK_FROM,
  },
  template: {
    appName: process.env.TEMPLATE_APP_NAME ?? 'CyberSafely',
    webUrl: process.env.WEB_URL ?? 'http://localhost:3000',
  },
}
