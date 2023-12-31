import config from '../config'
import { FacebookProvider } from '../libs/facebook'
import { InstagramProvider } from '../libs/instagram'
import { TikTokProvider } from '../libs/tiktok'
import { TwitterProvider } from '../libs/twitter'
import { composeAPIURL } from './url'

const SocialProviders: Partial<{
  twitter: TwitterProvider
  facebook: FacebookProvider
  instagram: InstagramProvider
  tiktok: TikTokProvider
}> = {}

const { twitter, facebook, instagram, tiktok } = config

if (!!twitter.clientId && !!twitter.clientSecret) {
  SocialProviders.twitter = new TwitterProvider({
    clientId: twitter.clientId,
    clientSecret: twitter.clientSecret,
    callbackURL: composeAPIURL(process.env.TWITTER_CALLBACK_URL ?? twitter.callbackURL),
  })
}

if (!!facebook.appId && !!facebook.appSecret) {
  SocialProviders.facebook = new FacebookProvider({
    appId: facebook.appId,
    appSecret: facebook.appSecret,
    callbackURL: composeAPIURL(process.env.FACEBOOK_CALLBACK_URL ?? facebook.callbackURL),
  })
}

if (!!instagram.appId && !!instagram.appSecret) {
  SocialProviders.instagram = new InstagramProvider({
    appId: instagram.appId,
    appSecret: instagram.appSecret,
    callbackURL: composeAPIURL(process.env.INSTAGRAM_CALLBACK_URL ?? instagram.callbackURL),
  })
}

if (!!tiktok.clientKey && !!tiktok.clientSecret) {
  SocialProviders.tiktok = new TikTokProvider({
    clientKey: tiktok.clientKey,
    clientSecret: tiktok.clientSecret,
    callbackURL: composeAPIURL(process.env.TIKTOK_CALLBACK_URL ?? tiktok.callbackURL),
  })
}

export function getSocialProvider<T extends keyof typeof SocialProviders>(key: T) {
  const provider = SocialProviders[key]

  if (!provider) {
    throw new Error(`Social provider "${key}" not initialized`)
  }

  return provider
}
