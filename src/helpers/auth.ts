import { Prisma, Team } from '@prisma/client'
import { UserInclude } from '../graphql/user/user.include'
import { ApolloContext } from '../types/apollo'
import { parseJwt } from '../utils/crypto'
import { NotAuthorizedError } from './errors'

function findUser(ctx: ApolloContext, id?: string) {
  const token = ctx.req.headers['x-token']

  const where: Prisma.UserWhereInput = {}

  if (typeof id === 'string') {
    where.id = id
  } else if (typeof token === 'string') {
    const jwt = parseJwt(token)
    where.uuid = jwt.uuid
  } else {
    throw new Error('Could not find user')
  }

  return ctx.prisma.user.findFirstOrThrow({
    where,
    include: UserInclude,
  })
}

type User = Awaited<ReturnType<typeof findUser>>

const UserRole = {
  staff: async (ctx: ApolloContext, initialUser: User) => {
    const behalfId = ctx.req.headers['x-behalf-id']

    let user = initialUser

    if (!user.roles.filter((e) => e.status === 'ACCEPTED').find((e) => e.role === 'STAFF')) {
      throw new Error('Not authorized')
    }

    if (typeof behalfId === 'string') {
      user = await findUser(ctx, behalfId)
    }

    return { user }
  },
  admin: async (ctx: ApolloContext, user: User) => {
    const teamId = ctx.req.headers['x-team-id']
    if (typeof teamId !== 'string') throw new Error('Team ID not found in headers')

    const role = user.roles
      .filter((e) => e.status === 'ACCEPTED')
      .find((e) => e.role === 'STAFF' || (e.role === 'ADMIN' && e.teamRole && e.teamRole.team.id === teamId))
    if (!role) throw new Error('Not authorized')

    const team = await ctx.prisma.team.findFirstOrThrow({
      where: { id: teamId },
    })

    return { user, team }
  },
  coach: async (ctx: ApolloContext, user: User) => {
    const teamId = ctx.req.headers['x-team-id']
    if (typeof teamId !== 'string') throw new Error('Team ID not found in headers')

    const role = user.roles
      .filter((e) => e.status === 'ACCEPTED')
      .find(
        (e) =>
          e.role === 'STAFF' ||
          ((e.role === 'ADMIN' || e.role === 'COACH') && e.teamRole && e.teamRole.team.id === teamId)
      )
    if (!role) throw new Error('Not authorized')

    const team = await ctx.prisma.team.findFirstOrThrow({
      where: { id: teamId },
    })

    return { user, team }
  },
  athlete: async (ctx: ApolloContext, user: User) => {
    const teamId = ctx.req.headers['x-team-id']
    if (typeof teamId !== 'string') throw new Error('Team ID not found in headers')

    const role = user.roles
      .filter((e) => e.status === 'ACCEPTED')
      .find((e) => e.role === 'STAFF' || (e.role === 'ATHLETE' && e.teamRole && e.teamRole.team.id === teamId))
    if (!role) throw new Error('Not authorized')

    const team = await ctx.prisma.team.findFirstOrThrow({
      where: { id: teamId },
    })

    return { user, team }
  },
  member: async (ctx: ApolloContext, user: User) => {
    const teamId = ctx.req.headers['x-team-id']
    if (typeof teamId !== 'string') throw new Error('Team ID not found in headers')

    const role = user.roles
      .filter((e) => e.status === 'ACCEPTED')
      .find(
        (e) =>
          e.role === 'STAFF' ||
          ((e.role === 'ADMIN' || e.role === 'COACH' || e.role === 'ATHLETE') &&
            e.teamRole &&
            e.teamRole.team.id === teamId)
      )
    if (!role) throw new Error('Not authorized')

    const team = await ctx.prisma.team.findFirstOrThrow({
      where: { id: teamId },
    })

    return { user, team }
  },
  parent: async (ctx: ApolloContext, user: User) => {
    const roles = user.roles
      .filter((e) => e.status === 'ACCEPTED')
      .filter((e) => e.role === 'STAFF' || (e.role === 'PARENT' && e.parentRole))

    if (roles.length === 0) {
      throw new Error('Not authorized')
    }

    return { user }
  },
  any: async (ctx: ApolloContext, user: User) => {
    let team: Team | undefined | null
    const teamId = ctx.req.headers['x-team-id']

    if (typeof teamId === 'string') {
      team = await ctx.prisma.team.findFirst({
        where: {
          id: teamId,
          roles: {
            some: {
              userRole: {
                userId: user.id,
                status: 'ACCEPTED',
                role: { in: ['ADMIN', 'COACH', 'ATHLETE'] },
              },
            },
          },
        },
      })
    }

    return { user, team }
  },
} as const

type UserRole = typeof UserRole
type Context<K extends keyof UserRole> = Awaited<ReturnType<UserRole[K]>>
type Callback<P, A, C, I, R> = (obj: P, args: A, ctx: C, info: I) => MaybePromise<R>

export function withAuth<Role extends keyof UserRole, P, A, C extends ApolloContext, I, R>(
  role: Role,
  callback: Callback<P, A, C & Context<Role>, I, R>
) {
  const wrapper: Callback<P, A, C, I, R> = async (obj, args, ctx, info) => {
    const user = await findUser(ctx).catch(() => {
      throw NotAuthorizedError
    })

    const currentUser = await UserRole.staff(ctx, user)
      .then((e) => e.user)
      .catch(() => user)

    const context = (await UserRole[role](ctx, currentUser).catch(() => {
      throw NotAuthorizedError
    })) as Context<Role>

    return await callback(obj, args, { ...ctx, ...context }, info)
  }

  return wrapper
}
