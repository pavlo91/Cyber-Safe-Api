import firebase from 'firebase-admin'
import config from '../config'
import logger from './logger'

interface Pusher {
  send(token: string | string[], message: string, data?: Record<string, string>): Promise<void>
}

class NoPusher implements Pusher {
  async send(token: string | string[], message: string, data?: Record<string, string>): Promise<void> {}
}

class FirebasePusher implements Pusher {
  private messaging

  constructor(config: object) {
    const app = firebase.initializeApp({
      credential: firebase.credential.cert(config),
    })

    this.messaging = app.messaging()
  }

  async send(token: string | string[], message: string, data?: Record<string, string>): Promise<void> {
    const tokens = Array.isArray(token) ? token : [token]

    await this.messaging
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
      })
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
