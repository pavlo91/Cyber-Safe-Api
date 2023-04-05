import { finishAnalysisJob } from '../libs/ai'
import { prisma } from '../prisma'
import { cron } from './cron'

// Runs every 30 mins
cron.schedule('0 */30 * * * *', async () => {
  const analysisItems = await prisma.analysisItem.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      jobId: { not: null },
      status: 'IN_PROGRESS',
    },
    include: {
      analysis: {
        include: {
          post: true,
        },
      },
    },
  })

  for (const analysisItem of analysisItems) {
    try {
      await finishAnalysisJob(analysisItem)
    } catch (error) {
      console.error(error)
    }
  }
})
