import Prisma from '@prisma/client'

export async function analysePostWithGoogleAI(post: Prisma.Prisma.PostGetPayload<{ include: { media: true } }>) {}
