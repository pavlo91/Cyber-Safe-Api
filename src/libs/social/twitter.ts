import Prisma from '@prisma/client'
import { Client, auth } from 'twitter-api-sdk'
import { components } from 'twitter-api-sdk/dist/types'
import { z } from 'zod'
import { prisma } from '../../prisma'
import { FetchAndSaveResult, SocialProvider } from './interface'

type TwitterMedia = components['schemas']['Photo'] &
  components['schemas']['Video'] &
  components['schemas']['AnimatedGif']

type TwitterPost = {
  id: string
  url: string
  text: string
  createdAt: Date
  media: {
    id: string
    type: 'IMAGE' | 'VIDEO'
    mime: string
    url: string
    width: number
    height: number
    duration: number
  }[]
}

export class TwitterProvider implements SocialProvider {
  private client: Client
  private state: Record<string, auth.OAuth2User> = {}
  private scopes: auth.OAuth2Scopes[] = ['offline.access', 'users.read', 'tweet.read', 'tweet.write']

  constructor(private config: { clientId: string; clientSecret: string; bearerToken: string; callbackURL: string }) {
    this.client = new Client(new auth.OAuth2Bearer(config.bearerToken))
  }

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

  async getAuthorizationURL(userId: string): Promise<string> {
    this.state[userId] = this.createTwitterAuthClient()
    return this.createAuthURL(this.state[userId], userId)
  }

  private parseCallback(data: unknown) {
    const schema = z.object({
      code: z.string(),
      state: z.string(),
    })

    const { code, state } = schema.parse(data)

    return { code, state }
  }

  private popState(token: string) {
    const requestState = this.state[token]

    if (!requestState) {
      throw new Error('State was not found')
    }

    delete this.state[token]

    return requestState
  }

  private async getMyUser(authClient: auth.OAuth2User) {
    const client = new Client(authClient)
    const { data, errors } = await client.users.findMyUser()

    if (errors && errors.length > 0) {
      throw new Error(errors[0].title)
    }

    return data!
  }

  async finishAuthorization(payload: unknown): Promise<void> {
    const { code, state: userId } = this.parseCallback(payload)
    const authClient = this.popState(userId)

    const { token } = await authClient.requestAccessToken(code)
    const user = await this.getMyUser(authClient)

    const twitter = await prisma.twitter.findFirst({
      where: { user: { id: userId } },
    })

    if (twitter) {
      await prisma.twitter.update({
        where: { id: twitter.id },
        data: {
          twitterId: user.id,
          twitterUsername: user.username,
          twitterAccessToken: token.access_token!,
          twitterRefreshToken: token.refresh_token!,
          twitterTokenExpiresAt: new Date(token.expires_at!),
        },
      })
    } else {
      await prisma.twitter.create({
        data: {
          twitterId: user.id,
          twitterUsername: user.username,
          twitterAccessToken: token.access_token!,
          twitterRefreshToken: token.refresh_token!,
          twitterTokenExpiresAt: new Date(token.expires_at!),
          user: { connect: { id: userId } },
        },
      })
    }
  }

  private createTwitterAuthClientFromTwitterUser(twitter: Prisma.Twitter) {
    return new auth.OAuth2User({
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
  }

  async refreshToken(socialId: string): Promise<void> {
    const twitter = await prisma.twitter.findUniqueOrThrow({
      where: { id: socialId },
    })

    const authClient = this.createTwitterAuthClientFromTwitterUser(twitter)

    const { token } = await authClient.refreshAccessToken()

    await prisma.twitter.update({
      where: { id: twitter.id },
      data: {
        twitterAccessToken: token.access_token!,
        twitterRefreshToken: token.refresh_token!,
        twitterTokenExpiresAt: new Date(token.expires_at!),
      },
    })
  }

  savePost(socialId: string, data: unknown): Promise<void> {
    throw new Error('Not implemented')
  }

  private async getPaginatedTweets(twitter: Prisma.Twitter, nextToken?: string) {
    const { data, includes, meta } = await this.client.tweets.usersIdTweets(twitter.twitterId, {
      max_results: 50,
      pagination_token: nextToken,
      exclude: ['replies', 'retweets'],
      expansions: ['attachments.media_keys'],
      start_time: twitter.indexedAt.toISOString(),
      'tweet.fields': ['id', 'text', 'created_at', 'attachments'],
      'media.fields': ['media_key', 'url', 'type', 'width', 'height', 'duration_ms', 'variants'],
    })

    const results: TwitterPost[] = []

    if (data) {
      results.push(
        ...data.map((data) => ({
          id: data.id,
          url: 'https://twitter.com/twitter/status/' + data.id,
          text: data.text,
          createdAt: new Date(data.created_at!),
          media:
            data.attachments?.media_keys?.map((id) => {
              const media = includes?.media?.find((e) => e.media_key === id) as TwitterMedia
              const variant = media?.variants?.find((e) => e.content_type?.startsWith('video/'))

              let type: Prisma.MediaType
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
                id,
                type,
                mime,
                width: media.width ?? 0,
                height: media.height ?? 0,
                duration: media.duration_ms ?? 0,
                url: media.url ?? variant?.url ?? '',
              }
            }) ?? [],
        }))
      )
    }

    if (meta?.next_token) {
      const newData = await this.getPaginatedTweets(twitter, meta.next_token)
      results.push(...newData)
    }

    return results
  }

  async fetchAndSavePosts(socialId: string): Promise<FetchAndSaveResult[]> {
    const twitter = await prisma.twitter.findFirstOrThrow({
      where: { id: socialId, user: { isNot: null } },
      include: { user: true },
    })

    const newIndexedAt = new Date()
    const posts = await this.getPaginatedTweets(twitter)

    const createdPosts = await Promise.all(
      posts.map((post) =>
        prisma.post
          .create({
            include: { media: true },
            data: {
              url: post.url,
              text: post.text,
              externalId: post.id,
              twitterId: twitter.id,
              userId: twitter.user!.id,
              media: {
                createMany: {
                  data: post.media.map((media) => ({
                    externalId: media.id,
                    type: media.type,
                    mime: media.mime,
                    url: media.url,
                    width: media.width,
                    height: media.height,
                    duration: media.duration,
                  })),
                },
              },
            },
          })
          .catch((error) => {
            console.error('Error while saving Twitter post:', error)
          })
      )
    )

    await prisma.twitter.update({
      where: { id: twitter.id },
      data: { indexedAt: newIndexedAt },
    })

    return createdPosts.filter((e) => !!e) as FetchAndSaveResult[]
  }

  async deletePost(externalId: string): Promise<void> {
    const post = await prisma.post.findFirstOrThrow({
      where: { externalId, twitterId: { not: null } },
      include: { twitter: true },
    })

    const authClient = this.createTwitterAuthClientFromTwitterUser(post.twitter!)
    const client = new Client(authClient)

    await client.tweets.deleteTweetById(externalId)
  }
}
