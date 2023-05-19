import { Facebook } from '@prisma/client'
import { add } from 'date-fns'
import { z } from 'zod'
import { fetchSchema } from '../utils/fetch'

class FacebookUser {
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
      name: z.string(),
    })

    const url = new URL('https://graph.facebook.com/me')
    url.searchParams.append('access_token', this.accessToken)

    return fetchSchema(schema, url)
  }

  async refreshToken() {
    const url = new URL('https://graph.facebook.com/v16.0/oauth/access_token')
    url.searchParams.append('grant_type', 'fb_exchange_token')
    url.searchParams.append('client_id', this.config.appId)
    url.searchParams.append('client_secret', this.config.appSecret)
    url.searchParams.append('fb_exchange_token', this.accessToken)

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

  // https://developers.facebook.com/docs/graph-api/reference/v16.0/user/posts
  deletePost(id: string) {
    throw new Error('This operation is not supported for Facebook')
  }
}

export class FacebookProvider {
  constructor(
    private config: {
      appId: string
      appSecret: string
      callbackURL: string
    }
  ) {}

  async getAuthorizationURL(state: string) {
    const url = new URL('https://www.facebook.com/v16.0/dialog/oauth')
    url.searchParams.append('client_id', this.config.appId)
    url.searchParams.append('redirect_uri', this.config.callbackURL)
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

  private getAccessToken(code: string) {
    const url = new URL('https://graph.facebook.com/v16.0/oauth/access_token')
    url.searchParams.append('client_id', this.config.appId)
    url.searchParams.append('redirect_uri', this.config.callbackURL)
    url.searchParams.append('client_secret', this.config.appSecret)
    url.searchParams.append('code', code)

    const schema = z.object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
    })

    return fetchSchema(schema, url)
  }

  async finishAuthorization(payload: unknown) {
    const { code, state } = this.parseCallback(payload)
    const { access_token, expires_in } = await this.getAccessToken(code)

    const facebookUser = new FacebookUser(this.config, access_token)
    const user = await facebookUser.getMyUser()

    return {
      state,
      id: user.id,
      username: user.name,
      accessToken: access_token,
      tokenExpiresAt: add(new Date(), { seconds: expires_in }),
    }
  }

  getFacebookUser(facebook: Facebook) {
    return new FacebookUser(this.config, facebook.facebookAccessToken)
  }
}
