import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend'
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
  model: Prisma.Prisma.AnalysisModelGetPayload<{ include: { analysis: { include: { post: true } } } }>,
  userId: string
) {
  await prisma.analysisModel.update({
    where: { id: model.id },
    data: { flagged: true },
  })

  sendPostFlaggedEmail(model.analysis.post, userId)
}

const client = new ComprehendClient({
  region: config.comprehend.region,
  credentials: {
    accessKeyId: config.comprehend.accessKey!,
    secretAccessKey: config.comprehend.secretKey!,
  },
})

export async function analyseTextFromPost(post: Prisma.Post, userId: string) {
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
      source: post.blobName!,
      analysisId: analysis.id,
    },
  })

  // Step 1 - check text with a set of words
  if (containsBlocklisted(post.text)) {
    await flagAnalysisModel(model, userId)
    return // No need to continue
  }

  // TODO: Step 2 - check text with Amazon Comprehend
  const sentiment = await client.send(
    new DetectSentimentCommand({
      Text: post.text,
      LanguageCode: 'en',
    })
  )

  if (sentiment.SentimentScore?.Negative && sentiment.SentimentScore.Negative > 0.75) {
    await flagAnalysisModel(model, userId)
    return // No need to continue
  }
}
