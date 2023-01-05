import { SocialMedia, SocialMediaPost } from '.'

export class FacebookSocialMedia implements SocialMedia {
  static parsePost(post: any): SocialMediaPost {
    return {
      id: '',
      createdAt: new Date(),
    }
  }

  constructor(public name: string, private token: string) {}

  async getPosts() {
    return [FacebookSocialMedia.parsePost({})]
  }
}
