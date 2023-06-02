import cron from '../libs/cron'
import '../modules'

const cronNames = process.argv.slice(2)

const crons = cron.getCrons()

for (const { cron, name } of crons) {
  cron.stop()

  if (cronNames.length === 0 || cronNames.includes(name)) {
    cron.now()
  }
}
