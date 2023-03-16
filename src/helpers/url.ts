import { config } from '../config'

function composeURL(base: string, path: string, query: Record<string, string | number>) {
  const url = new URL(path, base)

  Object.entries(query).forEach(([key, value]) => {
    if (url.pathname.includes(':' + key)) {
      url.pathname = url.pathname.replace(':' + key, String(value))
    } else {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

type ComposeAPIURL = {
  '/api/confirm/:token': { token: string }
  '/api/respond/:token/:response': { token: string; response: 'accept' | 'decline' }
  '/oauth2/twitter': {}
}

export function composeAPIURL<K extends keyof ComposeAPIURL>(path: K, query: ComposeAPIURL[K]) {
  return composeURL(config.apiURL, path, query)
}

type ComposeWebURL = {
  '/auth/login': {}
  '/auth/activate/:token': { token: string }
  '/auth/reset/:token': { token: string }
  '/dashboard/staff/users': { search?: string }
  '/dashboard/admin/members': { search?: string }
  '/dashboard/coach/members': { search?: string }
  '/dashboard/profile': {}
  '/dashboard/coach/posts/:postId': { postId: string }
}

export function composeWebURL<K extends keyof ComposeWebURL>(
  path: K,
  query: ComposeWebURL[K] & { [key: string]: string | number }
) {
  return composeURL(config.webURL, path, query)
}
