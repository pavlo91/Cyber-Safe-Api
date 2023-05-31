import axios, { AxiosRequestConfig } from 'axios'
import { z } from 'zod'

export async function fetchSchema<T>(schema: z.Schema<T>, config: AxiosRequestConfig<any>) {
  return await axios
    .request({
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    })
    .then(async (res) => {
      if (res.status >= 200 && res.status <= 299) {
        return res.data
      }
      throw new Error(JSON.stringify(res.data))
    })
    .then((data) => schema.parse(data))
}
