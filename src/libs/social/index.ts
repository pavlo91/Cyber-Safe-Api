import { composeAPIURL } from '../../helpers/url'
import { FacebookProvider } from './facebook'
import { SocialProvider } from './interface'
import { TwitterProvider } from './twitter'

export const SocialKeys = ['twitter', 'facebook'] as const

type SocialKey = (typeof SocialKeys)[number]

const SocialProviders: Partial<Record<SocialKey, SocialProvider>> = {}

SocialProviders.twitter = new TwitterProvider({
  consumerKey: 'CNTFCNvAbRG43c6EMkFj6epa3',
  consumerSecret: '3x5y7BpDVMxY3GPYFE72OIxYAAk6w1LIq1qs5fBFp9xywRfrbt',
  callbackURL: composeAPIURL('/oauth2/twitter', {}),
})

SocialProviders.facebook = new FacebookProvider({
  appId: '794531248463108',
  appSecret: 'e951cf98648d49c9e45020b64b7724a8',
  callbackURL: composeAPIURL('/oauth2/facebook', {}),
})

export function getSocialProvider(key: SocialKey) {
  const provider = SocialProviders[key]

  if (!provider) {
    throw new Error(`Social provider "${key}" not initialized`)
  }

  return provider
}
