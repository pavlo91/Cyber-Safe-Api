import { Facebook } from '@prisma/client'
import { add } from 'date-fns'
import { z } from 'zod'
import { fetchSchema } from '../utils/fetch'

export type FacebookPost = {
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

class FacebookUser {
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
      name: z.string(),
    })

    const url = new URL('https://graph.facebook.com/v17.0/me')
    url.searchParams.append('access_token', this.user.accessToken)

    return fetchSchema(schema, { url: url.toString() })
  }

  async refreshToken() {
    const url = new URL('https://graph.facebook.com/v17.0/oauth/access_token')
    url.searchParams.append('grant_type', 'fb_exchange_token')
    url.searchParams.append('client_id', this.config.appId)
    url.searchParams.append('client_secret', this.config.appSecret)
    url.searchParams.append('fb_exchange_token', this.user.accessToken)

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

  async fetchPosts(before: Date): Promise<FacebookPost[]> {
    const schema = z.object({
      data: z.array(
        z.object({
          id: z.string(),
          message: z.string().optional(),
          created_time: z.string(),
          permalink_url: z.string(),
          attachments: z
            .object({
              data: z.array(
                z.object({
                  media_type: z.string(),
                  media: z
                    .object({
                      image: z.object({
                        src: z.string(),
                      }),
                      source: z.string().optional(),
                    })
                    .optional(),
                  subattachments: z
                    .object({
                      data: z.array(
                        z.object({
                          media_type: z.string(),
                          media: z
                            .object({
                              image: z.object({
                                src: z.string(),
                              }),
                              source: z.string().optional(),
                            })
                            .optional(),
                        })
                      ),
                    })
                    .optional(),
                })
              ),
            })
            .optional(),
        })
      ),
    })

    // `media_type` can be `photo`, `video`, `album`, `link`, etc.

    const url = new URL(`https://graph.facebook.com/v17.0/${this.user.userId}/posts`)
    url.searchParams.append(
      'fields',
      'id,message,created_time,permalink_url,attachments{media_type,media,subattachments{media_type,media}}'
    )
    url.searchParams.append('since', String(Math.floor(before.valueOf() / 1000)))
    url.searchParams.append('limit', '50')
    url.searchParams.append('access_token', this.user.accessToken)

    const { data } = await fetchSchema(schema, {
      url: url.toString(),
    })

    return data.reduce((prev, curr) => {
      const media: FacebookPost['media'] = []

      if (curr.attachments) {
        for (const attachment of curr.attachments.data) {
          if (attachment.subattachments) {
            for (const subattachment of attachment.subattachments.data) {
              if (subattachment.media_type === 'video' && subattachment.media?.source) {
                media.push({
                  width: 0,
                  height: 0,
                  duration: 0,
                  type: 'VIDEO',
                  mime: 'video/mp4',
                  url: subattachment.media.source,
                  externalId: subattachment.media.source,
                })
              } else if (subattachment.media_type === 'photo' && subattachment.media) {
                media.push({
                  width: 0,
                  height: 0,
                  duration: 0,
                  type: 'IMAGE',
                  mime: 'image/jpeg',
                  url: subattachment.media.image.src,
                  externalId: subattachment.media.image.src,
                })
              }
            }
          } else if (attachment.media_type === 'video' && attachment.media?.source) {
            media.push({
              width: 0,
              height: 0,
              duration: 0,
              type: 'VIDEO',
              mime: 'video/mp4',
              url: attachment.media.source,
              externalId: attachment.media.source,
            })
          } else if (attachment.media_type === 'photo' && attachment.media) {
            media.push({
              width: 0,
              height: 0,
              duration: 0,
              type: 'IMAGE',
              mime: 'image/jpeg',
              url: attachment.media.image.src,
              externalId: attachment.media.image.src,
            })
          }
        }
      }

      if (media.length > 0) {
        prev.push({
          media,
          externalId: curr.id,
          url: curr.permalink_url,
          text: curr.message ?? '',
          createdAt: new Date(curr.created_time),
        })
      }

      return prev
    }, [] as FacebookPost[])
  }

  // https://developers.facebook.com/docs/graph-api/reference/v17.0/user/posts
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
    const url = new URL('https://www.facebook.com/v17.0/dialog/oauth')
    url.searchParams.append('client_id', this.config.appId)
    url.searchParams.append('redirect_uri', this.config.callbackURL)
    url.searchParams.append('state', state)
    url.searchParams.append('scope', 'public_profile,user_posts')

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
    const url = new URL('https://graph.facebook.com/v17.0/oauth/access_token')
    url.searchParams.append('client_id', this.config.appId)
    url.searchParams.append('redirect_uri', this.config.callbackURL)
    url.searchParams.append('client_secret', this.config.appSecret)
    url.searchParams.append('code', code)

    const schema = z.object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
    })

    return fetchSchema(schema, { url: url.toString() })
  }

  async finishAuthorization(payload: unknown) {
    const { code, state } = this.parseCallback(payload)
    const { access_token, expires_in } = await this.getAccessToken(code)

    const facebookUser = new FacebookUser(this.config, {
      accessToken: access_token,
      userId: '',
    })
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
    return new FacebookUser(this.config, {
      accessToken: facebook.facebookAccessToken,
      userId: facebook.facebookId,
    })
  }
}
