import { Membership, Relationship, User } from '@prisma/client'
import { ApolloContext } from '../types/apollo'
import { parseJwt } from '../utils/crypto'

type Callback<P, A, C, I, R> = (obj: P, args: A, ctx: C, info: I) => MaybePromise<R>

const AuthFlag = {
  staff: (user: User) => user.isStaff,
  parent: (user: User & { children: Relationship[] }) => user.children.length > 0,
  any: () => true,
} as const

type AuthFlag = keyof typeof AuthFlag

async function findUser(flag: AuthFlag, ctx: ApolloContext) {
  const token = ctx.req.headers['x-token']
  const behalfId = ctx.req.headers['x-behalf-id']

  if (typeof token !== 'string') {
    throw new Error('Token header was not found in request')
  }

  const include = {
    memberships: {
      include: {
        organization: true,
      },
    },
    children: {
      include: {
        childUser: true,
      },
    },
  }

  let user = await ctx.prisma.user.findFirstOrThrow({
    where: { ...parseJwt(token) },
    include,
  })

  if (typeof behalfId === 'string' && user.isStaff) {
    user = await ctx.prisma.user.findFirstOrThrow({
      where: { id: behalfId },
      include,
    })
  }

  if (!AuthFlag[flag](user)) {
    throw new Error("You don't have the required role")
  }

  return user
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

const AuthMembershipFlag = {
  admin: (membership: Membership) => membership.isAdmin,
  user: (membership: Membership) => !membership.isAdmin,
  any: () => true,
} as const

type AuthMembershipFlag = keyof typeof AuthMembershipFlag

async function findOrganization(flag: AuthMembershipFlag, user: FindUser['user'], ctx: ApolloContext) {
  const orgId = ctx.req.headers['x-org-id']

  if (typeof orgId !== 'string') {
    throw new Error('Organization header was not found in request')
  }

  // Staff can execute any route that an admin can execute
  if (user.isStaff) {
    return await ctx.prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
    })
  }

  const membership = user.memberships.find((e) => e.organizationId && AuthMembershipFlag[flag](e))

  if (!membership) {
    throw new Error("You don't have the required role in this organization")
  }

  return membership.organization
}

type FindOrganization = { organization: Awaited<ReturnType<typeof findOrganization>> }

export function withAuthMembership<P, A, C extends ApolloContext, I, R>(
  flag: AuthMembershipFlag,
  callback: Callback<P, A, C & FindUser & FindOrganization, I, R>
) {
  const wrapper: Callback<P, A, C, I, R> = async (obj, args, ctx, info) => {
    const user = await findUser('any', ctx)
    const organization = await findOrganization(flag, user, ctx)

    return await callback(obj, args, { ...ctx, user, organization }, info)
  }

  return wrapper
}
