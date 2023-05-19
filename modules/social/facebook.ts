import fastify from '../../libs/fastify'
import prisma from '../../libs/prisma'
import { getSocialProvider } from '../../utils/social'
import { composeWebURL } from '../../utils/url'

fastify.get('/oauth2/facebook', async (req, reply) => {
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

  reply.redirect(composeWebURL('/dashboard/profile'))

  return reply
})
