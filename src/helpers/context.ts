import { FastifyRequest } from 'fastify'
import { prisma } from '../prisma'
import { parseJWT } from '../utils/crypto'

function getUserFromToken(token: string) {
  const { uuid } = parseJWT(token)

  return prisma.user.findFirstOrThrow({
    where: { uuid },
    include: {
      roles: {
        include: {
          schoolRole: {
            include: {
              school: {
                include: {
                  roles: {
                    include: {
                      userRole: true,
                    },
                  },
                },
              },
            },
          },
          parentRole: true,
        },
      },
    },
  })
}

type GetUserFromToken = Awaited<ReturnType<typeof getUserFromToken>>

export type Context = {
  req: FastifyRequest
  user: GetUserFromToken | null
}

export async function getContextFromRequest(req: FastifyRequest) {
  const token = req.headers['x-token']

  const context: Context = {
    req,
    user: null,
  }

  if (typeof token === 'string') {
    context.user = await getUserFromToken(token)
  }

  return context
}
