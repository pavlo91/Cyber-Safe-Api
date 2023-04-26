import { config } from '../config'
import './confirm-email'
import './graphql'
import './twitter'

if (config.dev) {
  import('./preview')
}
