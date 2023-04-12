import { Prisma } from '@prisma/client'
import { sendUserRoleConfirmationEmail } from '../helpers/email'
import { prisma } from '../prisma'
import { randomToken } from '../utils/crypto'

async function findUserRoleAndSendConfirmationEmail(id: string) {
  const userRole = await prisma.userRole.findUniqueOrThrow({
    where: { id },
    include: {
      user: true,
      schoolRole: { include: { school: true } },
      parentRole: { include: { childUser: true } },
    },
  })

  sendUserRoleConfirmationEmail(userRole)
}

prisma.$use(async (params, next) => {
  const callbacks: ((data: any) => void)[] = []

  if (params.model === 'UserRole') {
    switch (params.action) {
      case 'create': {
        const { data } = params.args as Prisma.UserRoleCreateArgs

        if (!data.status || data.status === 'PENDING') {
          data.statusToken = randomToken()
          callbacks.push((data) => findUserRoleAndSendConfirmationEmail(data.id))
        }

        break
      }

      default:
        break
    }
  }

  const data: any = await next(params)

  callbacks.forEach((callback) => callback(data))

  return data
})
