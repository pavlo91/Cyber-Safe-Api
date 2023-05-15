import { config } from '../config'
import './confirm-email'
import './graphql'
import './oauth2'

if (config.dev) {
  import('./preview')
}
