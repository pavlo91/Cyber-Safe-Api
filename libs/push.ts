import firebase from 'firebase-admin'
import config from '../config'
import logger from './logger'

type Result = {
  removeTokens?: string[]
}

interface Pusher {
  send(token: string | string[], message: string, data?: Record<string, string>): Promise<Result>
}

class FirebasePusher implements Pusher {
  private messaging

  constructor(config: object) {
    const app = firebase.initializeApp({
      credential: firebase.credential.cert(config),
    })

    this.messaging = app.messaging()
  }

  async send(token: string | string[], message: string, data?: Record<string, string>): Promise<Result> {
    const tokens = Array.isArray(token) ? token : [token]

    if (tokens.length === 0) {
      return {}
    }

    const result = await this.messaging
      .sendEach(
        tokens.map((token) => ({
          data,
          token,
          notification: {
            body: message,
          },
        }))
      )
      .catch((error) => {
        logger.error('Error while sending push via Firebase: %s', error)
        return undefined
      })

    // Remove devices with these tokens because the tokens are no longer registered
    const removeTokens = result?.responses
      .map((e, i) =>
        !e.success && e.error?.code === 'messaging/registration-token-not-registered' ? tokens[i] : undefined
      )
      .filter((e) => !!e) as string[]

    return { removeTokens }
  }
}

class NoPusher implements Pusher {
  constructor() {
    logger.warn('No pusher loaded')
  }

  async send(token: string | string[], message: string, data?: Record<string, string>): Promise<Result> {
    logger.debug('Sending push to %s: %s', token, message)
    return {}
  }
}

let pusher: Pusher

const firebaseConfig = config.firebase.config

if (firebaseConfig) {
  pusher = new FirebasePusher(firebaseConfig)
} else {
  pusher = new NoPusher()
}

export default pusher
