import { Instagram } from '@prisma/client'
import { add } from 'date-fns'
import { stringify } from 'querystring'
import { z } from 'zod'
import { fetchSchema } from '../utils/fetch'

class InstagramUser {
  constructor(
    private config: {
      appId: string
      appSecret: string
      callbackURL: string
    },
    private accessToken: string
  ) {}

  getMyUser() {
    const schema = z.object({
      id: z.string(),
      username: z.string(),
    })

    const url = new URL('https://graph.instagram.com/v17.0/me')
    url.searchParams.append('fields', 'id,username')
    url.searchParams.append('access_token', this.accessToken)

    return fetchSchema(schema, url)
  }

  async refreshToken() {
    const url = new URL('https://graph.instagram.com/refresh_access_token')
    url.searchParams.append('grant_type', 'ig_refresh_token')
    url.searchParams.append('access_token', this.accessToken)

    const schema = z.object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
    })

    const { access_token, expires_in } = await fetchSchema(schema, url)

    return {
      accessToken: access_token,
      tokenExpiresAt: add(new Date(), { seconds: expires_in }),
    }
  }

  deletePost(id: string) {
    throw new Error('This operation is not supported for Instagram')
  }
}

export class InstagramProvider {
  constructor(
    private config: {
      appId: string
      appSecret: string
      callbackURL: string
    }
  ) {}

  async getAuthorizationURL(state: string) {
    const url = new URL('https://api.instagram.com/oauth/authorize')
    url.searchParams.append('client_id', this.config.appId)
    url.searchParams.append('redirect_uri', this.config.callbackURL)
    url.searchParams.append('scope', 'user_profile,user_media')
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('state', state)

    return url.toString()
  }

  private parseCallback(data: unknown) {
    const schema = z.object({
      code: z.string(),
      state: z.string(),
    })

    return schema.parse(data)
  }

  private getOauthAccessToken(code: string) {
    const schema = z.object({
      access_token: z.string(),
      user_id: z.number(),
    })

    return fetchSchema(schema, 'https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stringify({
        code,
        client_id: this.config.appId,
        grant_type: 'authorization_code',
        client_secret: this.config.appSecret,
        redirect_uri: this.config.callbackURL,
      }),
    })
  }

  private getAccessToken(access_token: string) {
    const schema = z.object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
    })

    const url = new URL('https://graph.instagram.com/access_token')
    url.searchParams.append('grant_type', 'ig_exchange_token')
    url.searchParams.append('client_secret', this.config.appSecret)
    url.searchParams.append('access_token', access_token)

    return fetchSchema(schema, url)
  }

  async finishAuthorization(payload: unknown) {
    const { code, state } = this.parseCallback(payload)
    const token = await this.getOauthAccessToken(code)
    const { access_token, expires_in } = await this.getAccessToken(token.access_token)

    const instagramUser = new InstagramUser(this.config, access_token)
    const user = await instagramUser.getMyUser()

    return {
      state,
      id: user.id,
      username: user.username,
      accessToken: access_token,
      tokenExpiresAt: add(new Date(), { seconds: expires_in }),
    }
  }

  getInstagramUser(instagram: Instagram) {
    return new InstagramUser(this.config, instagram.instagramAccessToken)
  }
}
