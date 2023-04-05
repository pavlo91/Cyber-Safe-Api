import { prisma } from '../prisma'

const Activities = {
  INVITE_USER: 'User Invited',
  INVITE_USER_RESPONDED: 'User Responded to Invite',
  PARENTAL_APPROVAL: 'Parent Update Child Approval',
}

type Activities = keyof typeof Activities

export const ActivityKeys = Object.keys(Activities) as Activities[]

export async function updateAllActivityTypes() {
  await prisma.$transaction(async (prisma) => {
    for (const [id, name] of Object.entries(Activities)) {
      await prisma.activityType.upsert({
        where: { id },
        update: { name },
        create: { id, name },
      })
    }
  })
}

export async function logActivity(typeId: Activities, userId: string) {
  await prisma.activity.create({
    data: { typeId, userId },
  })
}
