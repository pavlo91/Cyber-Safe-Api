import { TikTok } from '@prisma/client'
import { add } from 'date-fns'
import { stringify } from 'querystring'
import { z } from 'zod'
import { fetchSchema } from '../utils/fetch'

class TikTokUser {
  constructor(
    private config: { clientKey: string; clientSecret: string; callbackURL: string },
    private user: { accessToken: string; refreshToken: string }
  ) {}

  async refreshToken() {
    const schema = z.object({
      open_id: z.string(),
      scope: z.string(),
      access_token: z.string(),
      expires_in: z.number(),
      refresh_token: z.string(),
      refresh_expires_in: z.number(),
      token_type: z.string(),
    })

    const token = await fetchSchema(schema, {
      method: 'POST',
      url: 'https://open.tiktokapis.com/v2/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: stringify({
        grant_type: 'refresh_token',
        client_key: this.config.clientKey,
        refresh_token: this.user.refreshToken,
        client_secret: this.config.clientSecret,
      }),
    })

    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token!,
      tokenExpiresAt: add(new Date(), { seconds: token.expires_in }),
      refreshTokenExpiresAt: add(new Date(), { seconds: token.refresh_expires_in }),
    }
  }

  async getMyUser() {
    const schema = z.object({
      data: z.object({
        avatar_url: z.string(),
        open_id: z.string(),
        union_id: z.string(),
        display_name: z.string(),
      }),
    })

    const url = new URL('https://open.tiktokapis.com/v2/user/info')
    url.searchParams.append('fields', 'open_id,union_id,avatar_url,display_name')

    const { data } = await fetchSchema(schema, {
      url: url.toString(),
      headers: {
        Authorization: 'Bearer ' + this.user.accessToken,
      },
    })

    return data
  }
}

export class TikTokProvider {
  constructor(private config: { clientKey: string; clientSecret: string; callbackURL: string }) {}

  async getAuthorizationURL(state: string) {
    const url = new URL('https://www.tiktok.com/v2/auth/authorize')
    url.searchParams.append('client_key', this.config.clientKey)
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('scope', 'user.info.basic,video.list')
    url.searchParams.append('redirect_uri', this.config.callbackURL)
    url.searchParams.append('state', state)

    return url.toString()
  }

  private parseCallback(data: unknown) {
    const schema = z.object({
      code: z.string(),
      scopes: z.string(),
      state: z.string(),
      error: z.string().optional(),
      error_description: z.string().optional(),
    })

    const { code, scopes, state, error, error_description } = schema.parse(data)

    return { code, scopes, state, error, error_description }
  }

  private async getToken(code: string) {
    const schema = z.object({
      open_id: z.string(),
      scope: z.string(),
      access_token: z.string(),
      expires_in: z.number(),
      refresh_token: z.string(),
      refresh_expires_in: z.number(),
      token_type: z.string(),
    })

    return await fetchSchema(schema, {
      method: 'POST',
      url: 'https://open.tiktokapis.com/v2/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: stringify({
        code,
        grant_type: 'authorization_code',
        client_key: this.config.clientKey,
        redirect_uri: this.config.callbackURL,
        client_secret: this.config.clientSecret,
      }),
    })
  }

  async finishAuthorization(payload: unknown) {
    const { code, state } = this.parseCallback(payload)

    const token = await this.getToken(code)

    const tiktokUser = new TikTokUser(this.config, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
    })

    const user = await tiktokUser.getMyUser()

    return {
      state,
      id: user.open_id,
      username: user.display_name,
      accessToken: token.access_token,
      refreshToken: token.refresh_token!,
      tokenExpiresAt: add(new Date(), { seconds: token.expires_in }),
      refreshTokenExpiresAt: add(new Date(), { seconds: token.refresh_expires_in }),
    }
  }

  getTikTokUser(tiktok: TikTok) {
    return new TikTokUser(this.config, {
      accessToken: tiktok.tiktokAccessToken,
      refreshToken: tiktok.tiktokRefreshToken,
    })
  }
}
