import { parseJwt } from '../libs/crypto'
import { ApolloContext } from '../types/apollo'

type Callback<P, A, C, I, R> = (obj: P, args: A, ctx: C, info: I) => MaybePromise<R>

const AuthFlag = {
  staff: true,
  any: undefined,
} as const

type AuthFlag = keyof typeof AuthFlag

function findUser(flag: AuthFlag, ctx: ApolloContext) {
  const token = ctx.req.headers['x-token']

  if (typeof token !== 'string') {
    throw new Error('Token header was not found in request')
  }

  return ctx.prisma.user.findFirstOrThrow({
    where: {
      ...parseJwt(token),
      isStaff: AuthFlag[flag],
    },
    include: {
      membership: {
        include: {
          organization: true,
        },
      },
    },
  })
}

type FindUser = { user: Awaited<ReturnType<typeof findUser>> }

export function withAuth<P, A, C extends ApolloContext, I, R>(
  flag: AuthFlag,
  callback: Callback<P, A, C & FindUser, I, R>
) {
  const wrapper: Callback<P, A, C, I, R> = async (obj, args, ctx, info) => {
    const user = await findUser(flag, ctx)
    return await callback(obj, args, { ...ctx, user }, info)
  }

  return wrapper
}

const AuthMemberFlag = {
  admin: true,
  user: false,
  any: undefined,
} as const

type AuthMemberFlag = keyof typeof AuthMemberFlag

async function findOrganization(flag: AuthMemberFlag, user: FindUser['user'], ctx: ApolloContext) {
  // Staff can execute any route that an admin can execute
  if (user.isStaff) {
    const orgId = ctx.req.headers['x-org-id']

    if (typeof orgId !== 'string') {
      throw new Error('Organization header was not found in request')
    }

    return await ctx.prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
    })
  }

  const { membership } = user

  if (!membership) {
    throw new Error('You must be part of an organization')
  } else if (flag !== undefined && membership.isAdmin !== AuthMemberFlag[flag]) {
    throw new Error("You don't have the required role in this organization")
  }

  return membership.organization
}

type FindOrganization = { organization: Awaited<ReturnType<typeof findOrganization>> }

export function withAuthMember<P, A, C extends ApolloContext, I, R>(
  flag: AuthMemberFlag,
  callback: Callback<P, A, C & FindUser & FindOrganization, I, R>
) {
  const wrapper: Callback<P, A, C, I, R> = async (obj, args, ctx, info) => {
    const user = await findUser('any', ctx)
    const organization = await findOrganization(flag, user, ctx)

    return await callback(obj, args, { ...ctx, user, organization }, info)
  }

  return wrapper
}
