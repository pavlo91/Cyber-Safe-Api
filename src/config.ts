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

function parseNumber(value: string | undefined) {
  if (value) {
    const valueAsNumber = parseInt(value)
    if (!isNaN(valueAsNumber)) return valueAsNumber
  }
}

export const Config = {
  composeUrl,
  dev: process.env.NODE_ENV !== 'production',
  port: parseNumber(process.env.PORT) ?? 3001,
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
  },
}
