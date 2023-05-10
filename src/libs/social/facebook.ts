import { add } from 'date-fns'
import { z } from 'zod'
import { prisma } from '../../prisma'
import { fetchSchema } from './fetchSchema'
import { SocialProvider } from './interface'

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

  async finishAuthorization(data: unknown): Promise<void> {
    const { code, state: userId } = this.parseCallback(data)
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
          facebookToken: access_token,
          facebookTokenExpiration: add(new Date(), { seconds: expires_in }),
        },
      })
    } else {
      await prisma.facebook.create({
        data: {
          facebookId: user.id,
          facebookUsername: user.name,
          facebookToken: access_token,
          facebookTokenExpiration: add(new Date(), { seconds: expires_in }),
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

  async refreshToken(id: string): Promise<void> {
    const facebook = await prisma.facebook.findFirst({
      where: { id },
    })

    if (facebook) {
      const { access_token, expires_in } = await this.refreshAccessToken(facebook.facebookToken)

      await prisma.facebook.update({
        where: { id },
        data: {
          facebookToken: access_token,
          facebookTokenExpiration: add(new Date(), { seconds: expires_in }),
        },
      })
    }
  }
}
