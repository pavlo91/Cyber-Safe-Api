import cron from '../libs/cron'
import moderator from '../libs/moderator'
// import { finishAnalysisJob } from '../libs/moderator'
import prisma from '../libs/prisma'
import { analyzeItem } from '../utils/moderator'

// Create a cron job every 30 mins that gets in progress analysis items
// and checks them if they are done
cron.schedule('cron.video-moderation', '0 */30 * * * *', async () => {
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
    await analyzeItem(analysisItem.id, analysisItem.analysisId, analysisItem.source, () =>
      moderator.finishJobId(analysisItem.jobId!)
    )
  }
})
