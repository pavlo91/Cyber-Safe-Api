import { prisma } from '../prisma'

const Actions = {
  MARK_AS_ACCEPTABLE: 'Mark as Acceptable',
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
  switch (typeId) {
    case 'MARK_AS_ACCEPTABLE':
      await prisma.analysisItem.updateMany({
        where: { analysis: { postId } },
        data: { flagged: false },
      })
      break

    case 'NOTIFY_ATHLETE':
      // TODO:
      break

    case 'TAKE_DOWN_POST':
      // TODO:
      break
  }

  await prisma.action.create({
    data: { typeId, postId, userId },
  })
}
