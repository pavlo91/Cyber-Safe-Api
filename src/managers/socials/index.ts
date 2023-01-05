import { FacebookSocialMedia } from './facebook'

type User = {
  facebook?: string
}

export interface SocialMediaPost {
  id: string
  createdAt: Date
}

export interface SocialMedia {
  name: string
  getPosts(): MaybePromise<SocialMediaPost[]>
}

const SocialMediaKeys = ['facebook'] as const
type SocialMediaKeys = typeof SocialMediaKeys[number]

export class SocialMediaManager {
  static get(key: SocialMediaKeys, user: User): SocialMedia | undefined {
    switch (key) {
      case 'facebook':
        if (user.facebook) {
          return new FacebookSocialMedia('Facebook', user.facebook)
        }
      default:
        return
    }
  }

  static getAll(user: User) {
    return SocialMediaKeys.map((key) => this.get(key, user)).filter((e) => !!e) as SocialMedia[]
  }
}
