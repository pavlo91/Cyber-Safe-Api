import { Prisma } from '@prisma/client'
import { FastifyRequest } from 'fastify'
import prisma from '../libs/prisma'
import { TikTokPost } from '../libs/tiktok'
import { getSocialProvider } from './social'

export async function finishTikTokAuthorization(req: FastifyRequest) {
  const tiktokUser = await getSocialProvider('tiktok').finishAuthorization(req.query)

  const tiktok = await prisma.tikTok.findFirst({
    where: { user: { id: tiktokUser.state } },
  })

  if (tiktok) {
    await prisma.tikTok.update({
      where: { id: tiktok.id },
      data: {
        tiktokId: tiktokUser.id,
        tiktokUsername: tiktokUser.username,
        tiktokAccessToken: tiktokUser.accessToken,
        tiktokRefreshToken: tiktokUser.refreshToken,
        tiktokTokenExpiresAt: tiktokUser.tokenExpiresAt,
        tiktokRefreshTokenExpiresAt: tiktokUser.refreshTokenExpiresAt,
      },
    })
  } else {
    await prisma.tikTok.create({
      data: {
        tiktokId: tiktokUser.id,
        tiktokUsername: tiktokUser.username,
        tiktokAccessToken: tiktokUser.accessToken,
        tiktokRefreshToken: tiktokUser.refreshToken,
        tiktokTokenExpiresAt: tiktokUser.tokenExpiresAt,
        tiktokRefreshTokenExpiresAt: tiktokUser.refreshTokenExpiresAt,
        user: { connect: { id: tiktokUser.state } },
      },
    })
  }
}

export async function createTikTokPost(
  tiktok: Prisma.TikTokGetPayload<{ include: { user: true } }>,
  tiktokPost: TikTokPost
) {
  return await prisma.post.upsert({
    where: { externalId: tiktokPost.externalId },
    create: {
      ...tiktokPost,
      tiktokId: tiktok.id,
      userId: tiktok.user!.id,
      media: {
        createMany: {
          data: tiktokPost.media,
        },
      },
    },
    update: {
      ...tiktokPost,
      media: {
        deleteMany: {},
        createMany: {
          data: tiktokPost.media,
        },
      },
    },
    include: {
      media: true,
    },
  })
}
