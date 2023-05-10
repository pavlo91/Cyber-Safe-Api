import { OAuth } from 'oauth'
import { z } from 'zod'
import { prisma } from '../../prisma'
import { SocialProvider } from './interface'

type RequestToken = {
  token: string
  token_secret: string
}

type RequestState = {
  userId: string
  tokenSecret: string
}

export class TwitterProvider implements SocialProvider {
  private oauth: OAuth
  private state: Record<string, RequestState> = {}

  constructor(config: { consumerKey: string; consumerSecret: string; callbackURL: string }) {
    const { consumerKey, consumerSecret, callbackURL } = config

    this.oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      consumerKey,
      consumerSecret,
      '1.0a',
      callbackURL,
      'HMAC-SHA1'
    )
  }

  private getOAuthRequestToken() {
    return new Promise<RequestToken>((resolve, reject) => {
      this.oauth.getOAuthRequestToken((error, token, token_secret) => {
        if (error) {
          return reject(error)
        }
        resolve({ token, token_secret })
      })
    })
  }

  async getAuthorizationURL(userId: string): Promise<string> {
    const { token, token_secret } = await this.getOAuthRequestToken()

    this.state[token] = { userId, tokenSecret: token_secret }

    return 'https://api.twitter.com/oauth/authorize?oauth_token=' + token
  }

  private parseCallback(data: unknown) {
    const schema = z.object({
      oauth_token: z.string(),
      oauth_verifier: z.string(),
    })

    const { oauth_token, oauth_verifier } = schema.parse(data)

    return { oauth_token, oauth_verifier }
  }

  private popState(token: string) {
    const requestState = this.state[token]

    if (!requestState) {
      throw new Error('State was not found')
    }

    delete this.state[token]

    return requestState
  }

  private getOAuthAccessToken(token: string, tokenSecret: string, verifier: string) {
    return new Promise<RequestToken>((resolve, reject) => {
      this.oauth.getOAuthAccessToken(token, tokenSecret, verifier, (error, token, token_secret) => {
        if (error) {
          return reject(error)
        }
        resolve({ token, token_secret })
      })
    })
  }

  private getMyUser(token: string, tokenSecret: string) {
    const schema = z.object({
      id_str: z.string(),
      screen_name: z.string(),
    })

    return new Promise<z.infer<typeof schema>>((resolve, reject) => {
      this.oauth.get(
        'https://api.twitter.com/1.1/account/verify_credentials.json',
        token,
        tokenSecret,
        (error, data) => {
          try {
            if (error) {
              throw error
            }

            if (typeof data !== 'string') {
              throw new Error('Data is not of type string')
            }

            const json = JSON.parse(data)
            resolve(schema.parse(json))
          } catch (error) {
            reject(error)
          }
        }
      )
    })
  }

  async finishAuthorization(data: unknown): Promise<void> {
    const { oauth_token, oauth_verifier } = this.parseCallback(data)
    const { userId, tokenSecret } = this.popState(oauth_token)

    const oauth = await this.getOAuthAccessToken(oauth_token, tokenSecret, oauth_verifier)
    const user = await this.getMyUser(oauth.token, oauth.token_secret)

    const twitter = await prisma.twitter.findFirst({
      where: { user: { id: userId } },
    })

    if (twitter) {
      await prisma.twitter.update({
        where: { id: twitter.id },
        data: {
          twitterId: user.id_str,
          twitterUsername: user.screen_name,
          twitterToken: oauth.token,
          twitterTokenSecret: oauth.token_secret,
        },
      })
    } else {
      await prisma.twitter.create({
        data: {
          twitterId: user.id_str,
          twitterUsername: user.screen_name,
          twitterToken: oauth.token,
          twitterTokenSecret: oauth.token_secret,
        },
      })
    }
  }

  // This is not needed for Twitter OAuth 1.0a
  // https://developer.twitter.com/en/docs/authentication/oauth-1-0a/obtaining-user-access-tokens
  async refreshToken(userId: string): Promise<void> {}
}
