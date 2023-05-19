import config from '../config'
import { FacebookProvider } from '../libs/facebook'
import { TwitterProvider } from '../libs/twitter'
import { composeAPIURL } from './url'

const SocialProviders: Partial<{
  twitter: TwitterProvider
  facebook: FacebookProvider
}> = {}

const { twitter, facebook } = config

if (!!twitter.clientId && !!twitter.clientSecret) {
  SocialProviders.twitter = new TwitterProvider({
    clientId: twitter.clientId,
    clientSecret: twitter.clientSecret,
    callbackURL: composeAPIURL(twitter.callbackURL),
  })
}

if (!!facebook.appId && !!facebook.appSecret) {
  SocialProviders.facebook = new FacebookProvider({
    appId: facebook.appId,
    appSecret: facebook.appSecret,
    callbackURL: composeAPIURL(facebook.callbackURL),
  })
}

export function getSocialProvider<T extends keyof typeof SocialProviders>(key: T) {
  const provider = SocialProviders[key]

  if (!provider) {
    throw new Error(`Social provider "${key}" not initialized`)
  }

  return provider
}
