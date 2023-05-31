import cron from '../libs/cron'
import '../modules'

const crons = cron.getCrons()

for (const { cron } of crons) {
  cron.stop()
  cron.now()
}
