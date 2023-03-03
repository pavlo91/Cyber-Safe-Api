import { config } from '../config'

function composeURL(base: string, path: string, query: Record<string, string | number>) {
  const url = new URL(path, base)

  Object.keys(query).forEach((key) => {
    const value = String(query[key])

    if (url.pathname.includes(':' + key)) {
      url.pathname = url.pathname.replace(':' + key, value)
    } else {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

type ComposeAPIURL = {
  '/api/confirm/:token': { token: string }
  '/api/respond/:token/:response': { token: string; response: 'accept' | 'decline' }
}

export function composeAPIURL<K extends keyof ComposeAPIURL>(path: K, query: ComposeAPIURL[K]) {
  return composeURL(config.apiURL, path, query)
}

type ComposeWebURL = {
  '/auth/login': {}
  '/auth/activate/:token': { token: string }
  '/auth/reset/:token': { token: string }
  '/dashboard/staff/users': {}
  '/dashboard/admin/members': {}
  '/dashboard/coach/members': {}
}

export function composeWebURL<K extends keyof ComposeWebURL>(
  path: K,
  query: ComposeWebURL[K] & { [key: string]: string | number }
) {
  return composeURL(config.webURL, path, query)
}
