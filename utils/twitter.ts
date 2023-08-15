import { Prisma } from '@prisma/client'
import { FastifyRequest } from 'fastify'
import prisma from '../libs/prisma'
import { TwitterPost } from '../libs/twitter'
import { getSocialProvider } from './social'

export async function finishTwitterAuthorization(req: FastifyRequest) {
  const twitterUser = await getSocialProvider('twitter').finishAuthorization(req.query)

  const twitter = await prisma.twitter.findFirst({
    where: { user: { id: twitterUser.state } },
  })

  if (twitter) {
    await prisma.twitter.update({
      where: { id: twitter.id },
      data: {
        twitterId: twitterUser.id,
        twitterUsername: twitterUser.username,
        twitterAccessToken: twitterUser.accessToken,
        twitterRefreshToken: twitterUser.refreshToken,
        twitterTokenExpiresAt: new Date(twitterUser.tokenExpiresAt),
      },
    })
  } else {
    await prisma.twitter.create({
      data: {
        twitterId: twitterUser.id,
        twitterUsername: twitterUser.username,
        twitterAccessToken: twitterUser.accessToken,
        twitterRefreshToken: twitterUser.refreshToken,
        twitterTokenExpiresAt: new Date(twitterUser.tokenExpiresAt),
        user: { connect: { id: twitterUser.state } },
      },
    })
  }
}

export async function createTwitterPost(
  twitter: Prisma.TwitterGetPayload<{ include: { user: true } }>,
  twitterPost: TwitterPost
) {
  return await prisma.post.upsert({
    where: { externalId: twitterPost.externalId },
    create: {
      ...twitterPost,
      twitterId: twitter.id,
      userId: twitter.user!.id,
      media: {
        createMany: {
          data: twitterPost.media,
        },
      },
    },
    update: {
      ...twitterPost,
      media: {
        deleteMany: {},
        createMany: {
          data: twitterPost.media,
        },
      },
    },
    include: {
      media: true,
    },
  })
}
