import { z } from 'zod'

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

let envConfig = {
  dev: process.env.NODE_ENV !== 'production',
  port: parseInt(process.env.PORT ?? '3001'),
  secret: process.env.SECRET ?? 'secret',
  apiUrl: process.env.API_URL ?? 'http://localhost:3001',
  webUrl: process.env.WEB_URL ?? 'http://localhost:3000',
  composeUrl,
  postmark: {
    token: process.env.POSTMARK_TOKEN,
    from: process.env.POSTMARK_FROM,
  },
  template: {
    appName: 'CyberSafely',
  },
}

if (process.env.CONFIG) {
  const schema = z.object({
    dev: z.boolean(),
    port: z.number(),
    secret: z.string(),
    apiUrl: z.string(),
    webUrl: z.string(),
    postmark: z.object({
      token: z.string(),
      from: z.string(),
    }),
  })

  const json = JSON.parse(process.env.CONFIG)
  const jsonConfig = schema.partial().parse(json)

  envConfig = { ...envConfig, ...jsonConfig }
}

export const Config = envConfig
