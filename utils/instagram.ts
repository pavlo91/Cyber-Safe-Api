import { add } from 'date-fns'
import { FastifyRequest } from 'fastify'
import prisma from '../libs/prisma'
import { getSocialProvider } from './social'

export async function finishInstagramAuthorization(req: FastifyRequest) {
  const instagramUser = await getSocialProvider('instagram').finishAuthorization(req.query)

  const instagram = await prisma.instagram.findFirst({
    where: { user: { id: instagramUser.state } },
  })

  if (instagram) {
    await prisma.instagram.update({
      where: { id: instagram.id },
      data: {
        instagramId: instagramUser.id,
        instagramUsername: instagramUser.username,
        instagramAccessToken: instagramUser.accessToken,
        instagramTokenExpiresAt: instagramUser.tokenExpiresAt,
      },
    })
  } else {
    await prisma.instagram.create({
      data: {
        instagramId: instagramUser.id,
        instagramUsername: instagramUser.username,
        instagramAccessToken: instagramUser.accessToken,
        instagramTokenExpiresAt: instagramUser.tokenExpiresAt,
        user: { connect: { id: instagramUser.state } },
      },
    })
  }
}

export async function refreshExpiringInstagramTokens() {
  const lt = add(new Date(), { days: 3 })

  const instagrams = await prisma.instagram.findMany({
    where: { instagramTokenExpiresAt: { lt } },
  })

  for (const instagram of instagrams) {
    const token = await getSocialProvider('instagram').getInstagramUser(instagram).refreshToken()

    await prisma.instagram.update({
      where: { id: instagram.id },
      data: {
        instagramAccessToken: token.accessToken,
        instagramTokenExpiresAt: token.tokenExpiresAt,
      },
    })
  }
}
