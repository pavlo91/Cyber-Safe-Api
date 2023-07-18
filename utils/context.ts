import { FastifyRequest } from 'fastify'
import config from '../config'
import prisma from '../libs/prisma'
import { parseJWT } from './crypto'

async function getUserFromToken(token: string) {
  const { uuid } = parseJWT(token)

  return await prisma.user.findFirstOrThrow({
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

// User e-mail -> new e-mail
export const demoEmailMap: Record<string, string> = {}

export async function getContextFromRequest(req: FastifyRequest) {
  const token = req.headers['x-token']

  const context: Context = {
    req,
    user: null,
  }

  if (typeof token === 'string') {
    context.user = await getUserFromToken(token).catch(() => null)
  }

  if (config.demo && context.user) {
    const demoEmail = req.headers['x-demo-email']

    if (typeof demoEmail === 'string' && !!demoEmail) {
      demoEmailMap[context.user.email] = demoEmail
    } else {
      delete demoEmailMap[context.user.email]
    }
  }

  return context
}
