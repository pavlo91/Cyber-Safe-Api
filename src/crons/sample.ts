import { cron } from './cron'

cron.schedule('* * * * * *', () => {
  console.log('da')
})
