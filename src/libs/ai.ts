import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend'
import {
  DetectModerationLabelsCommand,
  GetContentModerationCommand,
  ModerationLabel,
  RekognitionClient,
  StartContentModerationCommand,
} from '@aws-sdk/client-rekognition'
import Prisma from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { config } from '../config'
import { sendPostFlaggedEmail } from '../helpers/email'
import { prisma } from '../prisma'

const files = ['racial.txt', 'suicide.txt']
const paths = files.map((name) => path.join(__dirname, '../../blocklist', name))
const lines = paths.flatMap((path) => fs.readFileSync(path, 'utf8').split('\n'))

function containsBlocklisted(text: string) {
  const normalizedText = text.toLowerCase()

  for (const line of lines) {
    if (normalizedText.includes(line)) {
      return true
    }
  }

  return false
}

type AnalysisResult = { flagged?: boolean; reason?: string; jobId?: string }

async function beginAnalysisItem(
  analysis: Prisma.Prisma.AnalysisGetPayload<{ include: { post: true } }>,
  type: Prisma.AnalysisItemType,
  source: string,
  callback: () => Promise<AnalysisResult | undefined>
) {
  try {
    const result = await callback()

    await prisma.analysisItem.create({
      data: {
        type,
        source,
        reason: result?.reason,
        analysisId: analysis.id,
        flagged: result?.flagged,
        status: result?.jobId ? 'IN_PROGRESS' : 'SUCCEEDED',
      },
    })

    if (result?.flagged) {
      sendPostFlaggedEmail(analysis.post)
    }
  } catch (error) {
    await prisma.analysisItem.create({
      data: {
        type,
        source,
        flagged: false,
        status: 'FAILED',
        error: String(error),
        analysisId: analysis.id,
      },
    })
  }
}

const comprehendClient = new ComprehendClient({
  region: config.comprehend.region,
  credentials: {
    accessKeyId: config.comprehend.accessKey!,
    secretAccessKey: config.comprehend.secretKey!,
  },
})

const rekognitionClient = new RekognitionClient({
  region: config.rekognition.region,
  credentials: {
    accessKeyId: config.rekognition.accessKey!,
    secretAccessKey: config.rekognition.secretKey!,
  },
})

function formatReason(...names: (string | undefined)[]) {
  return names.filter((e) => !!e).join('/')
}

function containsModerationLabel(moderationLabels: ModerationLabel[]) {
  for (const label of moderationLabels) {
    const foundLabel = config.rekognition.labels.find((e) => {
      const [parentName, name] = e.split('/')

      return (label.ParentName === parentName || parentName === '*') && (label.Name === name || name === '*')
    })

    if (foundLabel) {
      return true
    }
  }

  return false
}

export async function analyseTextFromPost(postId: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: { media: true },
  })

  const analysis = await prisma.analysis.upsert({
    update: {},
    include: { post: true },
    where: { postId: post.id },
    create: { postId: post.id },
  })

  // Step 1 - check text with a set of words
  // Step 2 - check text with Amazon Comprehend
  await beginAnalysisItem(analysis, 'TEXT', post.text, async () => {
    if (containsBlocklisted(post.text)) {
      return { flagged: true, reason: 'Blocklist' }
    }

    const sentiment = await comprehendClient.send(
      new DetectSentimentCommand({
        Text: post.text,
        LanguageCode: 'en',
      })
    )

    if (sentiment.SentimentScore?.Negative && sentiment.SentimentScore.Negative > 0.75) {
      return { flagged: true, reason: `Negativity` }
    }
  })

  // Step 3 - check images with Amazon Rekognition
  const images = post.media.filter((e) => e.type === 'IMAGE' && e.blobName)

  for (const image of images) {
    await beginAnalysisItem(analysis, 'MEDIA', image.blobName!, async () => {
      const moderation = await rekognitionClient.send(
        new DetectModerationLabelsCommand({
          Image: {
            S3Object: {
              Name: image.blobName!,
              Bucket: config.storage.bucketMedia,
            },
          },
        })
      )

      if (moderation.ModerationLabels && containsModerationLabel(moderation.ModerationLabels)) {
        return {
          flagged: true,
          reason: moderation.ModerationLabels.map((e) => formatReason(e.ParentName, e.Name)).join(', '),
        }
      }
    })
  }

  // Step 4 - check videos with Amazon Rekognition
  const videos = post.media.filter((e) => e.type === 'VIDEO' && e.blobName)

  for (const video of videos) {
    await beginAnalysisItem(analysis, 'MEDIA', video.blobName!, async () => {
      const moderation = await rekognitionClient.send(
        new StartContentModerationCommand({
          Video: {
            S3Object: {
              Name: video.blobName!,
              Bucket: config.storage.bucketMedia,
            },
          },
        })
      )

      if (moderation.JobId) {
        return { jobId: moderation.JobId }
      }
    })
  }
}

export async function finishAnalysisJob(
  analysisItem: Prisma.Prisma.AnalysisItemGetPayload<{ include: { analysis: { include: { post: true } } } }>
) {
  if (!analysisItem.jobId) {
    return
  }

  const moderation = await rekognitionClient.send(
    new GetContentModerationCommand({
      JobId: analysisItem.jobId!,
    })
  )

  if (moderation.JobStatus === 'SUCCEEDED') {
    if (
      moderation.ModerationLabels &&
      containsModerationLabel(
        moderation.ModerationLabels.filter((e) => !!e.ModerationLabel).map((e) => e.ModerationLabel!)
      )
    ) {
      await prisma.analysisItem.update({
        where: { id: analysisItem.id },
        data: {
          flagged: true,
          status: 'SUCCEEDED',
          reason: moderation.ModerationLabels.map(({ ModerationLabel }) =>
            formatReason(ModerationLabel?.ParentName, ModerationLabel?.Name)
          ).join(', '),
        },
      })

      sendPostFlaggedEmail(analysisItem.analysis.post)
    }
  } else if (moderation.JobStatus === 'FAILED') {
    console.error(`Get video moderation failed with status message: ${moderation.StatusMessage}`)

    await prisma.analysisItem.update({
      where: { id: analysisItem.id },
      data: {
        status: 'FAILED',
        error: moderation.StatusMessage,
      },
    })
  }
}
