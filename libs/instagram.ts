import { Instagram } from '@prisma/client'
import { add } from 'date-fns'
import { stringify } from 'querystring'
import { z } from 'zod'
import { fetchSchema } from '../utils/fetch'

export type InstagramPost = {
  text: string
  externalId: string
  createdAt: Date
  url: string
  media: {
    type: 'IMAGE' | 'VIDEO'
    mime: string
    externalId: string
    width: number
    height: number
    duration: number
    url: string
  }[]
}

class InstagramUser {
  constructor(
    private config: {
      appId: string
      appSecret: string
      callbackURL: string
    },
    private user: {
      accessToken: string
      userId: string
    }
  ) {}

  getMyUser() {
    const schema = z.object({
      id: z.string(),
      username: z.string(),
    })

    const url = new URL('https://graph.instagram.com/v17.0/me')
    url.searchParams.append('fields', 'id,username')
    url.searchParams.append('access_token', this.user.accessToken)

    return fetchSchema(schema, { url: url.toString() })
  }

  async refreshToken() {
    const url = new URL('https://graph.instagram.com/refresh_access_token')
    url.searchParams.append('grant_type', 'ig_refresh_token')
    url.searchParams.append('access_token', this.user.accessToken)

    const schema = z.object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
    })

    const { access_token, expires_in } = await fetchSchema(schema, { url: url.toString() })

    return {
      accessToken: access_token,
      tokenExpiresAt: add(new Date(), { seconds: expires_in }),
    }
  }

  async fetchPosts(before: Date): Promise<InstagramPost[]> {
    const schema = z.object({
      data: z.array(
        z.object({
          id: z.string(),
          caption: z.string(),
          media_type: z.enum(['CAROUSEL_ALBUM', 'IMAGE', 'VIDEO']),
          media_url: z.string(),
          timestamp: z.string(),
          permalink: z.string(),
          children: z
            .object({
              data: z.array(
                z.object({
                  id: z.string(),
                  media_type: z.enum(['IMAGE', 'VIDEO']),
                  media_url: z.string(),
                })
              ),
            })
            .optional(),
        })
      ),
    })

    const url = new URL(`https://graph.instagram.com/v17.0/${this.user.userId}/media`)
    url.searchParams.append(
      'fields',
      'id,caption,media_type,media_url,timestamp,permalink,children{id,media_type,media_url}'
    )
    url.searchParams.append('since', String(Math.floor(before.valueOf() / 1000)))
    url.searchParams.append('limit', '50')
    url.searchParams.append('access_token', this.user.accessToken)

    const { data } = await fetchSchema(schema, {
      url: url.toString(),
    })

    return data.map((post) => ({
      text: post.caption,
      url: post.permalink,
      externalId: post.id,
      createdAt: new Date(post.timestamp),
      media:
        post.media_type === 'CAROUSEL_ALBUM' && post.children
          ? post.children.data.map((media) => ({
              width: 0,
              height: 0,
              duration: 0,
              url: media.media_url,
              externalId: media.id,
              type: media.media_type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
              mime: media.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
            }))
          : [
              {
                width: 0,
                height: 0,
                duration: 0,
                url: post.media_url,
                externalId: post.id,
                type: post.media_type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
                mime: post.media_type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
              },
            ],
    }))
  }

  // https://developers.facebook.com/docs/instagram-api/reference/ig-media
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

    return fetchSchema(schema, {
      method: 'POST',
      url: 'https://api.instagram.com/oauth/access_token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: stringify({
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

    return fetchSchema(schema, { url: url.toString() })
  }

  async finishAuthorization(payload: unknown) {
    const { code, state } = this.parseCallback(payload)
    const token = await this.getOauthAccessToken(code)
    const { access_token, expires_in } = await this.getAccessToken(token.access_token)

    const instagramUser = new InstagramUser(this.config, {
      accessToken: access_token,
      userId: '',
    })
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
    return new InstagramUser(this.config, {
      accessToken: instagram.instagramAccessToken,
      userId: instagram.instagramId,
    })
  }
}
