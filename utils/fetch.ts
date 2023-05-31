import { z } from 'zod'

export function fetchSchema<T>(schema: z.Schema<T>, url: URL | string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
    .then(async (res) => {
      if (res.status >= 200 && res.status <= 299) {
        return await res.json()
      }
      throw new Error(await res.text())
    })
    .then((data) => schema.parse(data))
}
