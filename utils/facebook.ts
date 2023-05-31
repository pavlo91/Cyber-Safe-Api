import { add } from 'date-fns'
import { FastifyRequest } from 'fastify'
import prisma from '../libs/prisma'
import { getSocialProvider } from './social'

export async function finishFacebookAuthorization(req: FastifyRequest) {
  const facebookUser = await getSocialProvider('facebook').finishAuthorization(req.query)

  const facebook = await prisma.facebook.findFirst({
    where: { user: { id: facebookUser.state } },
  })

  if (facebook) {
    await prisma.facebook.update({
      where: { id: facebook.id },
      data: {
        facebookId: facebookUser.id,
        facebookUsername: facebookUser.username,
        facebookAccessToken: facebookUser.accessToken,
        facebookTokenExpiresAt: facebookUser.tokenExpiresAt,
      },
    })
  } else {
    await prisma.facebook.create({
      data: {
        facebookId: facebookUser.id,
        facebookUsername: facebookUser.username,
        facebookAccessToken: facebookUser.accessToken,
        facebookTokenExpiresAt: facebookUser.tokenExpiresAt,
        user: { connect: { id: facebookUser.state } },
      },
    })
  }
}

export async function refreshExpiringFacebookTokens() {
  const lt = add(new Date(), { days: 3 })

  const facebooks = await prisma.facebook.findMany({
    where: { facebookTokenExpiresAt: { lt } },
  })

  for (const facebook of facebooks) {
    const token = await getSocialProvider('facebook').getFacebookUser(facebook).refreshToken()

    await prisma.facebook.update({
      where: { id: facebook.id },
      data: {
        facebookAccessToken: token.accessToken,
        facebookTokenExpiresAt: token.tokenExpiresAt,
      },
    })
  }
}
