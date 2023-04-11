import { deleteTwitterPostFromTwitterUser } from '../libs/twitter'
import { prisma } from '../prisma'
import { sendNotification } from './notification'

const Actions = {
  MARK_AS_ACCEPTABLE: 'Mark as Acceptable',
  MARK_AS_NOT_ACCEPTABLE: 'Mark as Not Acceptable',
  NOTIFY_STUDENT: 'Notify Student',
  TAKE_DOWN_POST: 'Take Down Post',
}

type Actions = keyof typeof Actions

export const ActionKeys = Object.keys(Actions) as Actions[]

export async function updateAllActionTypes() {
  await prisma.$transaction(async (prisma) => {
    for (const [id, name] of Object.entries(Actions)) {
      await prisma.actionType.upsert({
        where: { id },
        update: { name },
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
      await prisma.post.update({
        where: { id: postId },
        data: {
          flagged: false,
          manualReview: true,
        },
      })
      break

    case 'MARK_AS_NOT_ACCEPTABLE':
      await prisma.post.updateMany({
        where: { id: postId },
        data: {
          flagged: true,
          manualReview: true,
        },
      })
      break

    case 'NOTIFY_STUDENT':
      await sendNotification(post.userId, 'notifyStudentAboutPost', post.url)
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
