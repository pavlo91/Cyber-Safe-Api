import { TikTok } from '@prisma/client'
import { add } from 'date-fns'
import { stringify } from 'querystring'
import { z } from 'zod'
import { fetchSchema } from '../utils/fetch'
import { sendSocialDisconnectNotification } from '../utils/notification'
import logger from './logger'
import prisma from './prisma'

export type TikTokPost = {
  text: string
  externalId: string
  createdAt: Date
  url: string
  media: {
    type: 'VIDEO'
    mime: 'video/mp4'
    externalId: string
    width: number
    height: number
    duration: number
    url: string
  }[]
}

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
      url: 'https://open.tiktokapis.com/v2/oauth/token/',
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
        user: z.object({
          avatar_url: z.string(),
          open_id: z.string(),
          union_id: z.string(),
          display_name: z.string(),
        }),
      }),
    })

    const url = new URL('https://open.tiktokapis.com/v2/user/info/')
    url.searchParams.append('fields', 'open_id,union_id,avatar_url,display_name')

    const { data } = await fetchSchema(schema, {
      url: url.toString(),
      headers: {
        Authorization: 'Bearer ' + this.user.accessToken,
      },
    })

    return data.user
  }

  private async parseVideoURL(share_url: string) {
    const schema = z.object({
      video: z.object({
        url: z.object({
          no_wm: z.string(),
        }),
      }),
    })

    // The original lib was taken down so I copied the src
    const getInfo = require('./tiktok-downloader')
    const data = await getInfo(share_url)

    return schema.parse(data).video.url.no_wm
  }

  async fetchPosts(before: Date) {
    const schema = z.object({
      data: z.object({
        videos: z.array(
          z.object({
            id: z.string(),
            create_time: z.number(),
            duration: z.number(),
            height: z.number(),
            width: z.number(),
            title: z.string(),
            share_url: z.string(),
          })
        ),
      }),
    })

    const url = new URL('https://open.tiktokapis.com/v2/video/list/')
    url.searchParams.append('fields', 'id,create_time,duration,height,width,title,share_url')

    const { data } = await fetchSchema(schema, {
      method: 'POST',
      url: url.toString(),
      headers: {
        Authorization: 'Bearer ' + this.user.accessToken,
      },
      data: JSON.stringify({
        max_count: 20,
      }),
    })

    const results: TikTokPost[] = []

    const videos = data.videos.filter((e) => e.create_time * 1000 >= before.valueOf())

    for (const data of videos) {
      const media: TikTokPost['media'] = []

      // Try to parse the TikTok video url, if not import an empty media array
      try {
        const url = await this.parseVideoURL(data.share_url)

        media.push({
          url,
          type: 'VIDEO',
          mime: 'video/mp4',
          externalId: data.id,
          width: data.width,
          height: data.height,
          duration: data.duration * 1000,
        })
      } catch (error) {
        logger.error('Error while parsing TikTok video url: %o', error)
      }

      results.push({
        media,
        text: data.title,
        url: data.share_url,
        externalId: data.id,
        createdAt: new Date(data.create_time * 1000),
      })
    }

    return results
  }

  deletePost(id: string) {
    throw new Error('This operation is not supported for TikTok')
  }
}

export class TikTokProvider {
  constructor(private config: { clientKey: string; clientSecret: string; callbackURL: string }) {}

  async getAuthorizationURL(state: string) {
    const url = new URL('https://www.tiktok.com/v2/auth/authorize/')
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

    if (!!error_description) {
      throw new Error(error_description)
    }

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
      url: 'https://open.tiktokapis.com/v2/oauth/token/',
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

  async getTikTokUser(tiktok: TikTok): Promise<TikTokUser> {
    const tiktokUser = new TikTokUser(this.config, {
      accessToken: tiktok.tiktokAccessToken,
      refreshToken: tiktok.tiktokRefreshToken,
    })

    if (tiktok.tiktokTokenExpiresAt < new Date()) {
      logger.info('Refreshing TikTok token for: %s', tiktok.id)

      try {
        const token = await tiktokUser.refreshToken()

        const newTikTok = await prisma.tikTok.update({
          where: { id: tiktok.id },
          data: {
            tiktokAccessToken: token.accessToken,
            tiktokRefreshToken: token.refreshToken,
            tiktokTokenExpiresAt: token.tokenExpiresAt,
            tiktokRefreshTokenExpiresAt: token.refreshTokenExpiresAt,
          },
        })

        return await this.getTikTokUser(newTikTok)
      } catch (error) {
        await sendSocialDisconnectNotification({ tiktok })
        await prisma.tikTok.delete({ where: { id: tiktok.id } })

        throw error
      }
    }

    return tiktokUser
  }
}
