import { AnalysisItemSeverity, Prisma } from '@prisma/client'
import logger from '../libs/logger'
import moderator, { ModeratorResult } from '../libs/moderator'
import prisma from '../libs/prisma'
import storage from '../libs/storage'
import { sendFlaggedPostNotification } from './notification'

export async function analyzeItem(
  analysisItemId: string | undefined,
  analysisId: string,
  source: string,
  callback: () => Promise<ModeratorResult>
): Promise<ModeratorResult | undefined> {
  const analysisItem = analysisItemId
    ? await prisma.analysisItem.findUniqueOrThrow({
        where: { id: analysisItemId },
      })
    : await prisma.analysisItem.create({
        data: {
          source,
          status: 'IN_PROGRESS',
          analysisId: analysisId,
          type: source.startsWith('http') ? 'MEDIA' : 'TEXT',
        },
      })

  try {
    const result = await callback()

    await prisma.analysisItem.update({
      where: { id: analysisItem.id },
      data: {
        severity: result.status === 'flagged' ? result.severity : 'NONE',
        reason: result.status === 'flagged' ? result.reason : undefined,
        jobId: result.status === 'in_progress' ? result.jobId : undefined,
        status: result.status === 'in_progress' ? 'IN_PROGRESS' : 'SUCCEEDED',
      },
    })

    return result
  } catch (error) {
    logger.error('Error while analyzing item source %s: %s', source, error)

    await prisma.analysisItem.update({
      where: { id: analysisItem.id },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : String(error),
      },
    })
  }
}

export async function analyzePost(postId: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: {
      media: true,
      analysis: true,
      user: {
        include: {
          roles: {
            include: {
              schoolRole: true,
            },
          },
        },
      },
    },
  })

  const analysis = post.analysis ?? (await prisma.analysis.create({ data: { postId } }))

  let severity: AnalysisItemSeverity = 'NONE'

  function setSeverity(result: ModeratorResult | undefined) {
    const rank: Record<AnalysisItemSeverity, number> = {
      NONE: 0,
      LOW: 1,
      HIGH: 2,
    }

    if (result && result.status === 'flagged') {
      if (rank[result.severity] > rank[severity]) {
        severity = result.severity
      }
    }
  }

  const resultText = await analyzeItem(undefined, analysis.id, post.text, () => moderator.analyzeText(post.text))
  setSeverity(resultText)

  for (const media of post.media) {
    if (!media.blobURL) {
      logger.warn('Skipping analysis of media %s because no blob was uploaded...', media.id)
      continue
    }

    switch (media.type) {
      case 'IMAGE':
        const resultImage = await analyzeItem(undefined, analysis.id, media.blobURL, () =>
          moderator.analyzeImage(media.blobURL!)
        )
        setSeverity(resultImage)
        break
      case 'VIDEO':
        const resultVideo = await analyzeItem(undefined, analysis.id, media.blobURL, () =>
          moderator.analyzeVideo(media.blobURL!)
        )
        setSeverity(resultVideo)
        break
    }
  }

  await prisma.post.update({
    where: { id: postId },
    data: { severity },
  })

  if (severity !== 'NONE') {
    sendFlaggedPostNotification(post)
  }
}

export async function uploadAndAnalyzePost(post: Prisma.PostGetPayload<{ include: { media: true } }>) {
  const uploadedText = await storage.uploadText(post.text, 'private', storage.getRandomBlobName('posts', post.id))

  await prisma.post.update({
    where: { id: post.id },
    data: { blobURL: uploadedText.blobURL },
  })

  for (const media of post.media) {
    const uploadedMedia = await storage.uploadFromURL(
      media.url,
      'private',
      storage.getRandomBlobName('posts', post.id, 'media', media.id)
    )

    await prisma.media.update({
      where: { id: media.id },
      data: { blobURL: uploadedMedia.blobURL },
    })
  }

  await analyzePost(post.id)
}
