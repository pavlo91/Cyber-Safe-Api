import { config } from '../../config'
import { composeAPIURL } from '../../helpers/url'
import { FacebookProvider } from './facebook'
import { SocialProvider } from './interface'
import { TwitterProvider } from './twitter'

export const SocialKeys = ['twitter', 'facebook'] as const

type SocialKey = (typeof SocialKeys)[number]

const SocialProviders: Partial<Record<SocialKey, SocialProvider>> = {}

if (!!config.twitter.clientId && !!config.twitter.clientSecret && !!config.twitter.bearerToken) {
  SocialProviders.twitter = new TwitterProvider({
    clientId: config.twitter.clientId,
    clientSecret: config.twitter.clientSecret,
    bearerToken: config.twitter.bearerToken,
    callbackURL: composeAPIURL('/oauth2/twitter', {}),
  })
}

if (!!config.facebook.appId && !!config.facebook.appSecret) {
  SocialProviders.facebook = new FacebookProvider({
    appId: config.facebook.appId,
    appSecret: config.facebook.appSecret,
    callbackURL: composeAPIURL('/oauth2/facebook', {}),
  })
}

export function getSocialProvider(key: SocialKey) {
  const provider = SocialProviders[key]

  if (!provider) {
    throw new Error(`Social provider "${key}" not initialized`)
  }

  return provider
}
