import { cron } from './cron'
import './index'

const crons = cron.getTasks().values()

for (const cron of crons) {
  cron.stop()
  cron.now()
}
