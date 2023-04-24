import Prisma from '@prisma/client'
import { auth, Client } from 'twitter-api-sdk'
import { components } from 'twitter-api-sdk/dist/types'
import { config } from '../config'
import { composeAPIURL } from '../helpers/url'
import { prisma } from '../prisma'

const scopes: auth.OAuth2Scopes[] = ['offline.access', 'users.read', 'tweet.read', 'tweet.write']
const callback = composeAPIURL('/oauth2/twitter', {})

function createTwitterAuthClient(token?: auth.OAuth2UserOptions['token']) {
  return new auth.OAuth2User({
    token,
    scopes,
    callback,
    client_id: config.twitter.clientId!,
    client_secret: config.twitter.clientSecret!,
  })
}

async function createTwitterAuthClientFromTwitterUser(twitter: Prisma.Twitter) {
  const authClient = new auth.OAuth2User({
    scopes,
    callback,
    client_id: config.twitter.clientId!,
    client_secret: config.twitter.clientSecret!,
    token: {
      refresh_token: twitter.refreshToken,
      access_token: twitter.token,
      expires_at: twitter.expiresAt.valueOf(),
    },
  })

  if (authClient.isAccessTokenExpired()) {
    const { token } = await authClient.refreshAccessToken()

    await prisma.twitter.update({
      where: { id: twitter.id },
      data: {
        token: token.access_token!,
        expiresAt: new Date(token.expires_at!),
        refreshToken: token.refresh_token!,
      },
    })
  }

  return authClient
}

function createAuthURL(client: auth.OAuth2User, state: string) {
  return client.generateAuthURL({
    state,
    code_challenge_method: 's256',
  })
}

const authClients: Record<string, auth.OAuth2User> = {}

export function getAuthURLForUserId(userId: string) {
  authClients[userId] = createTwitterAuthClient()
  return createAuthURL(authClients[userId], userId)
}

export async function getUserFromCallback(code: string, state: string) {
  const authClient = authClients[state]
  if (!authClient) throw new Error('Twitter auth client was not found')

  const { token } = await authClient.requestAccessToken(code)

  const client = new Client(authClient)
  const { data, errors } = await client.users.findMyUser()

  if (errors && errors.length > 0) {
    throw new Error(errors[0].title)
  }

  const user = await prisma.twitter.create({
    data: {
      twitterId: data!.id,
      token: token.access_token!,
      twitterUsername: data!.username,
      user: { connect: { id: state } },
      refreshToken: token.refresh_token!,
      expiresAt: new Date(token.expires_at!),
    },
  })

  delete authClients[state]

  return user
}

const client = config.twitter.bearerToken ? new Client(new auth.OAuth2Bearer(config.twitter.bearerToken)) : undefined

const MAX_RESULTS = 50

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

async function getPaginatedTweets(twitter: Prisma.Twitter, nextToken?: string) {
  if (!client) {
    throw new Error('Twitter client not initialized')
  }

  const { data, includes, meta } = await client.tweets.usersIdTweets(twitter.twitterId, {
    max_results: MAX_RESULTS,
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
    const newData = await getPaginatedTweets(twitter, meta.next_token)
    results.push(...newData)
  }

  return results
}

export function getPostsFromTwitterUser(twitter: Prisma.Twitter) {
  return getPaginatedTweets(twitter)
}

export async function deleteTwitterPostFromTwitterUser(id: string, twitter: Prisma.Twitter) {
  const authClient = await createTwitterAuthClientFromTwitterUser(twitter)
  const client = new Client(authClient)

  await client.tweets.deleteTweetById(id)
}