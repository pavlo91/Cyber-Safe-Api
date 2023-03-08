import Prisma from '@prisma/client'
import { prisma } from '../prisma'

export async function analysePostWithGoogleAI(post: Prisma.Post) {
  const analysis = await prisma.analysis.upsert({
    where: { postId: post.id },
    update: {},
    create: {
      postId: post.id,
    },
  })

  // TODO: Analyze post.text

  await prisma.analysisModel.create({
    data: {
      type: 'TEXT',
      source: post.text,
      analysisId: analysis.id,
    },
  })

  // TODO: Analyze post.media

  const postMedia = await prisma.media.findMany({
    where: {
      postId: post.id,
      blobName: { not: null },
    },
  })

  for (const media of postMedia) {
    await prisma.analysisModel.create({
      data: {
        type: 'MEDIA',
        source: media.blobName!,
        analysisId: analysis.id,
      },
    })
  }
}
