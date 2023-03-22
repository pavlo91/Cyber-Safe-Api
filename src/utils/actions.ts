import { deleteTwitterPostFromTwitterUser } from '../libs/twitter'
import { prisma } from '../prisma'
import { sendNotification } from './notification'

const Actions = {
  MARK_AS_ACCEPTABLE: 'Mark as Acceptable',
  MARK_AS_NOT_ACCEPTABLE: 'Mark as Not Acceptable',
  NOTIFY_ATHLETE: 'Notify Athlete',
  TAKE_DOWN_POST: 'Take Down Post',
}

type Actions = keyof typeof Actions

export const ActionKeys = Object.keys(Actions) as Actions[]

export async function updateAllActionTypes() {
  await prisma.$transaction(async (prisma) => {
    for (const [id, name] of Object.entries(Actions)) {
      await prisma.actionType.upsert({
        update: {},
        where: { id },
        create: { id, name },
      })
    }
  })
}

export async function executeAction(typeId: Actions, postId: string, userId?: string) {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    include: { twitter: true },
  })

  switch (typeId) {
    case 'MARK_AS_ACCEPTABLE':
      await prisma.analysisItem.updateMany({
        where: { analysis: { postId } },
        data: {
          flagged: false,
          manualReview: true,
        },
      })
      break

    case 'MARK_AS_NOT_ACCEPTABLE':
      await prisma.analysisItem.updateMany({
        where: { analysis: { postId } },
        data: {
          flagged: true,
          manualReview: true,
        },
      })
      break

    case 'NOTIFY_ATHLETE':
      await sendNotification(post.userId, 'notifyAthleteAboutPost', post.url)
      break

    case 'TAKE_DOWN_POST':
      if (post.twitter) {
        await deleteTwitterPostFromTwitterUser(post.externalId, post.twitter)
      }
      break
  }

  await prisma.action.create({
    data: { typeId, postId, userId },
  })
}
