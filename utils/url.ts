import config from '../config'

export function composeURL(base: string, path: string, query?: Record<string, string | number>) {
  const url = new URL(path, base)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (url.pathname.includes(':' + key)) {
        url.pathname = url.pathname.replace(':' + key, String(value))
      } else {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return url.toString()
}

export function composeAPIURL(path: string, query?: Record<string, string | number>) {
  return composeURL(config.apiURL, path, query)
}

export function composeWebURL(path: string, query?: Record<string, string | number>) {
  return composeURL(config.webURL, path, query)
}
