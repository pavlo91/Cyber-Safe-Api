import { add } from 'date-fns'
import { FastifyRequest } from 'fastify'
import prisma from '../libs/prisma'
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

export async function refreshExpiringTikTokTokens() {
  const alt = add(new Date(), { hours: 2 })
  const rlt = add(new Date(), { days: 3 })

  const tiktoks = await prisma.tikTok.findMany({
    where: {
      OR: [{ tiktokTokenExpiresAt: { lt: alt } }, { tiktokRefreshTokenExpiresAt: { lt: rlt } }],
    },
  })

  for (const tiktok of tiktoks) {
    const token = await getSocialProvider('tiktok').getTikTokUser(tiktok).refreshToken()

    await prisma.tikTok.update({
      where: { id: tiktok.id },
      data: {
        tiktokAccessToken: token.accessToken,
        tiktokRefreshToken: token.refreshToken,
        tiktokTokenExpiresAt: token.tokenExpiresAt,
        tiktokRefreshTokenExpiresAt: token.refreshTokenExpiresAt,
      },
    })
  }
}
