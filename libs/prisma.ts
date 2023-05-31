import { Prisma, PrismaClient } from '@prisma/client'
import { hashPassword } from '../utils/crypto'

const prisma = new PrismaClient()

// Middleware for hashing user password
prisma.$use((params, next) => {
  if (params.model === 'User') {
    switch (params.action) {
      case 'create': {
        const { data } = params.args as Prisma.UserCreateArgs

        data.password = hashPassword(data.password)

        break
      }

      case 'createMany': {
        const { data } = params.args as Prisma.UserCreateManyArgs

        if (Array.isArray(data)) {
          data.forEach((data) => {
            data.password = hashPassword(data.password)
          })
        } else {
          data.password = hashPassword(data.password)
        }

        break
      }

      case 'update': {
        const { data } = params.args as Prisma.UserUpdateArgs

        if (typeof data.password === 'string') {
          data.password = hashPassword(data.password)
        }

        break
      }

      case 'updateMany': {
        const { data } = params.args as Prisma.UserUpdateManyArgs

        if (typeof data.password === 'string') {
          data.password = hashPassword(data.password)
        }

        break
      }

      case 'upsert': {
        const { create, update } = params.args as Prisma.UserUpsertArgs

        create.password = hashPassword(create.password)

        if (typeof update.password === 'string') {
          update.password = hashPassword(update.password)
        }

        break
      }

      default:
        break
    }
  }

  return next(params)
})

export default prisma
