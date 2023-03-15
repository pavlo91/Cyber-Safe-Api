import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend'
import {
  DetectModerationLabelsCommand,
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

async function flagAnalysisModel(
  model: Prisma.Prisma.AnalysisModelGetPayload<{ include: { analysis: { include: { post: true } } } }>
) {
  await prisma.analysisModel.update({
    where: { id: model.id },
    data: { flagged: true },
  })

  sendPostFlaggedEmail(model.analysis.post)
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

export async function analyseTextFromPost(postId: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: { media: true },
  })

  const analysis = await prisma.analysis.upsert({
    update: {},
    where: { postId: post.id },
    create: { postId: post.id },
  })

  const model = await prisma.analysisModel.create({
    include: {
      analysis: {
        include: {
          post: true,
        },
      },
    },
    data: {
      type: 'TEXT',
      source: post.text,
      analysisId: analysis.id,
    },
  })

  // Step 1 - check text with a set of words
  if (containsBlocklisted(post.text)) {
    await flagAnalysisModel(model)
    return // No need to continue
  }

  // Step 2 - check text with Amazon Comprehend
  const sentiment = await comprehendClient.send(
    new DetectSentimentCommand({
      Text: post.text,
      LanguageCode: 'en',
    })
  )

  if (
    sentiment.SentimentScore?.Negative &&
    sentiment.SentimentScore.Negative >= config.comprehend.minNegativeSentiment
  ) {
    await flagAnalysisModel(model)
    return // No need to continue
  }

  // Step 3 - check images with Amazon Rekognition
  const images = post.media.filter((e) => e.type === 'IMAGE' && e.blobName)

  for (const image of images) {
    const model = await prisma.analysisModel.create({
      include: {
        analysis: {
          include: {
            post: true,
          },
        },
      },
      data: {
        type: 'MEDIA',
        source: image.blobName!,
        analysisId: analysis.id,
      },
    })

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

    if (
      moderation.ModerationLabels &&
      moderation.ModerationLabels.length >= config.rekognition.minImageModerationLabels
    ) {
      await flagAnalysisModel(model)
      return // No need to continue
    }
  }

  // Step 4 - check videos with Amazon Rekognition
  const videos = post.media.filter((e) => e.type === 'VIDEO' && e.blobName)

  for (const video of videos) {
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
      await prisma.analysisModel.create({
        include: {
          analysis: {
            include: {
              post: true,
            },
          },
        },
        data: {
          type: 'MEDIA',
          source: video.blobName!,
          analysisId: analysis.id,
          jobId: moderation.JobId,
        },
      })
    }
  }
}
