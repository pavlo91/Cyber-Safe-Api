import Prisma from '@prisma/client'
import { add } from 'date-fns'
import { z } from 'zod'
import { prisma } from '../../prisma'
import { fetchSchema } from './fetchSchema'
import { FetchAndSaveResult, SocialProvider } from './interface'

export class FacebookProvider implements SocialProvider {
  constructor(
    private config: {
      appId: string
      appSecret: string
      callbackURL: string
    }
  ) {}

  async getAuthorizationURL(userId: string): Promise<string> {
    const url = new URL('https://www.facebook.com/v16.0/dialog/oauth')
    url.searchParams.append('client_id', this.config.appId)
    url.searchParams.append('redirect_uri', this.config.callbackURL)
    url.searchParams.append('state', userId)

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

  private getMyUser(accessToken: string) {
    const schema = z.object({
      id: z.string(),
      name: z.string(),
    })

    const url = new URL('https://graph.facebook.com/me')
    url.searchParams.append('access_token', accessToken)

    return fetchSchema(schema, url)
  }

  async finishAuthorization(payload: unknown): Promise<void> {
    const { code, state: userId } = this.parseCallback(payload)
    const { access_token, expires_in } = await this.getAccessToken(code)

    const user = await this.getMyUser(access_token)

    const facebook = await prisma.facebook.findFirst({
      where: { user: { id: userId } },
    })

    if (facebook) {
      await prisma.facebook.update({
        where: { id: facebook.id },
        data: {
          facebookId: user.id,
          facebookUsername: user.name,
          facebookAccessToken: access_token,
          facebookTokenExpiresAt: add(new Date(), { seconds: expires_in }),
        },
      })
    } else {
      await prisma.facebook.create({
        data: {
          facebookId: user.id,
          facebookUsername: user.name,
          facebookAccessToken: access_token,
          facebookTokenExpiresAt: add(new Date(), { seconds: expires_in }),
          user: { connect: { id: userId } },
        },
      })
    }
  }

  private refreshAccessToken(accessToken: string) {
    const url = new URL('https://graph.facebook.com/v16.0/oauth/access_token')
    url.searchParams.append('grant_type', 'fb_exchange_token')
    url.searchParams.append('client_id', this.config.appId)
    url.searchParams.append('client_secret', this.config.appSecret)
    url.searchParams.append('fb_exchange_token', accessToken)

    const schema = z.object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
    })

    return fetchSchema(schema, url)
  }

  async refreshToken(socialId: string): Promise<void> {
    const facebook = await prisma.facebook.findFirst({
      where: { id: socialId },
    })

    if (facebook) {
      const { access_token, expires_in } = await this.refreshAccessToken(facebook.facebookAccessToken)

      await prisma.facebook.update({
        where: { id: facebook.id },
        data: {
          facebookAccessToken: access_token,
          facebookTokenExpiresAt: add(new Date(), { seconds: expires_in }),
        },
      })
    }
  }

  savePost(socialId: string, payload: unknown): Promise<void> {
    throw new Error('Not implemented')
  }

  // https://developers.facebook.com/docs/graph-api/reference/v16.0/user/posts
  private async getPaginatedPosts(facebook: Prisma.Prisma.FacebookGetPayload<{ include: { user: true } }>) {
    const url = new URL(`https://graph.facebook.com/v16.0/${facebook.user!.id}/posts`)
    url.searchParams.append('access_token', facebook.facebookAccessToken)

    const schema = z.object({
      data: z.array(z.object({})),
      paging: z.object({}),
    })

    const data = await fetchSchema(schema, url)
  }

  async fetchAndSavePosts(socialId: string): Promise<FetchAndSaveResult[]> {
    const facebook = await prisma.facebook.findFirstOrThrow({
      where: { id: socialId, user: { isNot: null } },
      include: { user: true },
    })

    const posts = this.getPaginatedPosts(facebook)

    return []
  }

  // https://developers.facebook.com/docs/graph-api/reference/v16.0/user/posts
  deletePost(externalId: string): Promise<void> {
    throw new Error('This operation is not supported for Facebook')
  }
}
