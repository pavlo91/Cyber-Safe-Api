import { MediaType, Twitter } from '@prisma/client'
import { Client, auth } from 'twitter-api-sdk'
import { z } from 'zod'
import logger from './logger'
import prisma from './prisma'

export type TwitterPost = Awaited<ReturnType<TwitterUser['fetchPosts']>>[0]

export class TwitterUser {
  constructor(private authClient: auth.OAuth2User, private id: string = '') {}

  async refreshToken() {
    const { token } = await this.authClient.refreshAccessToken()

    return {
      accessToken: token.access_token!,
      refreshToken: token.refresh_token!,
      tokenExpiresAt: new Date(token.expires_at!),
    }
  }

  async getMyUser() {
    const client = new Client(this.authClient)
    const { data } = await client.users.findMyUser()
    return data!
  }

  async fetchPosts(before: Date) {
    const client = new Client(this.authClient)

    const { data, includes } = await client.tweets.usersIdTweets(this.id, {
      max_results: 100,
      exclude: ['replies', 'retweets'],
      start_time: before.toISOString(),
      expansions: ['attachments.media_keys'],
      'tweet.fields': ['id', 'text', 'created_at', 'attachments'],
      'media.fields': ['media_key', 'url', 'type', 'width', 'height', 'duration_ms', 'variants'],
    })

    return (
      data?.map((data) => ({
        text: data.text,
        externalId: data.id,
        createdAt: new Date(data.created_at!),
        url: 'https://twitter.com/twitter/status/' + data.id,
        media:
          data.attachments?.media_keys?.map((id) => {
            const media = includes?.media?.find((e) => e.media_key === id) as any
            const variant = media.variants?.find((e: any) => e.content_type?.startsWith('video/'))

            let type: MediaType
            let mime: string

            switch (media.type) {
              case 'animated_gif':
              case 'video':
                type = 'VIDEO'
                mime = variant?.content_type ?? 'video/mp4'
                break
              default:
                type = 'IMAGE'
                mime = 'image/jpeg'
                break
            }

            return {
              type,
              mime,
              externalId: id,
              width: media.width ?? 0,
              height: media.height ?? 0,
              duration: media.duration_ms ?? 0,
              url: media.url ?? variant?.url ?? '',
            }
          }) ?? [],
      })) ?? []
    )
  }

  async deletePost(id: string) {
    const client = new Client(this.authClient)
    await client.tweets.deleteTweetById(id)
  }
}

export class TwitterProvider {
  private state: Record<string, auth.OAuth2User> = {}
  private scopes: auth.OAuth2Scopes[] = ['offline.access', 'users.read', 'tweet.read', 'tweet.write']

  constructor(private config: { clientId: string; clientSecret: string; callbackURL: string }) {}

  private createTwitterAuthClient(token?: auth.OAuth2UserOptions['token']) {
    return new auth.OAuth2User({
      token,
      scopes: this.scopes,
      client_id: this.config.clientId,
      callback: this.config.callbackURL,
      client_secret: this.config.clientSecret,
    })
  }

  private createAuthURL(client: auth.OAuth2User, state: string) {
    return client.generateAuthURL({
      state,
      code_challenge_method: 's256',
    })
  }

  async getAuthorizationURL(state: string) {
    this.state[state] = this.createTwitterAuthClient()
    return this.createAuthURL(this.state[state], state)
  }

  private parseCallback(data: unknown) {
    const schema = z.object({
      code: z.string(),
      state: z.string(),
    })

    const { code, state } = schema.parse(data)

    return { code, state }
  }

  private popState(state: string) {
    const requestState = this.state[state]

    if (!requestState) {
      throw new Error('State was not found')
    }

    delete this.state[state]

    return requestState
  }

  async finishAuthorization(payload: unknown) {
    const { code, state } = this.parseCallback(payload)
    const authClient = this.popState(state)

    const { token } = await authClient.requestAccessToken(code)

    const twitterUser = new TwitterUser(authClient)
    const user = await twitterUser.getMyUser()

    return {
      state,
      id: user.id,
      username: user.username,
      accessToken: token.access_token!,
      refreshToken: token.refresh_token!,
      tokenExpiresAt: new Date(token.expires_at!),
    }
  }

  async getTwitterUser(twitter: Twitter): Promise<TwitterUser> {
    if (!twitter.twitterAccessToken) {
      throw new Error('Twitter account has no access token')
    }

    const authClient = new auth.OAuth2User({
      scopes: this.scopes,
      client_id: this.config.clientId,
      callback: this.config.callbackURL,
      client_secret: this.config.clientSecret,
      token: {
        access_token: twitter.twitterAccessToken,
        refresh_token: twitter.twitterRefreshToken,
        expires_at: twitter.twitterTokenExpiresAt.valueOf(),
      },
    })

    const twitterUser = new TwitterUser(authClient, twitter.twitterId)

    if (twitter.twitterTokenExpiresAt < new Date()) {
      logger.info('Refreshing Twitter token for: %s', twitter.id)

      const token = await twitterUser.refreshToken()

      const newTwitter = await prisma.twitter.update({
        where: { id: twitter.id },
        data: {
          twitterAccessToken: token.accessToken,
          twitterRefreshToken: token.refreshToken,
          twitterTokenExpiresAt: token.tokenExpiresAt,
        },
      })

      return await this.getTwitterUser(newTwitter)
    }

    return twitterUser
  }
}
