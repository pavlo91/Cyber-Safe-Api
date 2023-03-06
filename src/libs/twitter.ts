import Prisma from '@prisma/client'
import { auth, Client } from 'twitter-api-sdk'
import { config } from '../config'
import { composeAPIURL } from '../helpers/url'

function createTwitterAuthClient(token?: auth.OAuth2UserOptions['token']) {
  return new auth.OAuth2User({
    token,
    client_id: config.twitter.clientId!,
    scopes: ['tweet.read', 'users.read'],
    client_secret: config.twitter.clientSecret!,
    callback: composeAPIURL('/oauth2/twitter', {}),
  })
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

  await authClient.requestAccessToken(code)
  // TODO: save token, if expired then refresh + save new token

  const client = new Client(authClient)
  const { data, errors } = await client.users.findMyUser()

  if (errors && errors.length > 0) {
    console.error(`Error while getting Twitter user from callback: ${errors}`)
    throw new Error(errors[0].title)
  }

  delete authClients[state]

  return data!
}

function getClientForTwitterUser(twitter: Pick<Prisma.Twitter, 'id'>) {
  const authClient = createTwitterAuthClient()
  return new Client(authClient)
}
