import { GetContentModerationCommand, RekognitionClient } from '@aws-sdk/client-rekognition'
import { config } from '../config'
import { sendPostFlaggedEmail } from '../helpers/email'
import { prisma } from '../prisma'
import { cron } from './cron'

const rekognitionClient = new RekognitionClient({
  region: config.rekognition.region,
  credentials: {
    accessKeyId: config.rekognition.accessKey!,
    secretAccessKey: config.rekognition.secretKey!,
  },
})

// Runs every 30 mins
cron.schedule('0 */30 * * * *', async () => {
  const analysisModels = await prisma.analysisModel.findMany({
    orderBy: { createdAt: 'desc' },
    where: { jobId: { not: null } },
    include: {
      analysis: {
        include: {
          post: true,
        },
      },
    },
  })

  for (const analysisModel of analysisModels) {
    try {
      const moderation = await rekognitionClient.send(
        new GetContentModerationCommand({
          JobId: analysisModel.jobId!,
        })
      )

      if (moderation.JobStatus === 'SUCCEEDED') {
        if (
          moderation.ModerationLabels &&
          moderation.ModerationLabels.length >= config.rekognition.minVideoModerationLabels
        ) {
          await prisma.analysisModel.update({
            where: { id: analysisModel.id },
            data: { flagged: true },
          })

          sendPostFlaggedEmail(analysisModel.analysis.post)
        }
      } else if (moderation.JobStatus === 'FAILED') {
        console.error(`Get video moderation failed with status message: ${moderation.StatusMessage}`)
      }

      if (moderation.JobStatus !== 'IN_PROGRESS') {
        await prisma.analysisModel.update({
          where: { id: analysisModel.id },
          data: { jobId: null },
        })
      }
    } catch (error) {
      console.error(error)
    }
  }
})
