import { Prisma, Role } from '@prisma/client'
import { TeamInclude } from '../graphql/team/team.include'
import { UserInclude } from '../graphql/user/user.include'
import { ApolloContext } from '../types/apollo'
import { parseJwt } from '../utils/crypto'
import { Logger } from '../utils/logger'
import { NotAuthorizedError } from './errors'

function findTeamOrThrow({ req, prisma }: ApolloContext) {
  const id = req.headers['x-team-id']

  if (typeof id !== 'string') {
    throw new Error('No x-team-id found in headers')
  }

  return prisma.team.findUniqueOrThrow({
    where: { id },
    include: TeamInclude,
  })
}

function findUserWithRolesOrThrow({ req, prisma }: ApolloContext, roles: Role[], teamId?: string) {
  const token = req.headers['x-token']

  if (typeof token !== 'string') {
    throw new Error('No x-token found in headers')
  }

  const { uuid } = parseJwt(token)

  let OR: Prisma.UserRoleWhereInput[] = []

  for (const role of roles) {
    const where: Prisma.UserRoleWhereInput = { role }

    if (!!teamId) {
      where.teamRole = { teamId }
    }

    OR.push(where)
  }

  if (OR.length > 0) {
    if (!OR.find((e) => e.role === 'STAFF')) {
      OR.push({ role: 'STAFF' })
    }

    // Make them all accepted
    OR = OR.map((e) => ({
      ...e,
      status: 'ACCEPTED',
    }))
  }

  const where: Prisma.UserWhereInput = { uuid }
  let include: Prisma.UserInclude = UserInclude

  if (OR.length > 0) {
    where.roles = { some: { OR } }

    include = {
      ...UserInclude,
      roles: {
        ...UserInclude.roles,
        where: { OR },
      },
    }
  }

  return prisma.user.findFirstOrThrow({ where, include }) as Prisma.Prisma__UserClient<
    Prisma.UserGetPayload<UserInclude>
  >
}

type AuthFn = (ctx: ApolloContext) => Promise<any>

const Auth = {
  staff: async (ctx) => {
    const user = await findUserWithRolesOrThrow(ctx, ['STAFF'])
    return { user }
  },
  admin: async (ctx) => {
    const team = await findTeamOrThrow(ctx)
    const user = await findUserWithRolesOrThrow(ctx, ['ADMIN'], team.id)
    return { user, team }
  },
  coach: async (ctx) => {
    const team = await findTeamOrThrow(ctx)
    const user = await findUserWithRolesOrThrow(ctx, ['ADMIN', 'COACH'], team.id)
    return { user, team }
  },
  athlete: async (ctx) => {
    const team = await findTeamOrThrow(ctx)
    const user = await findUserWithRolesOrThrow(ctx, ['ATHLETE'], team.id)
    return { user, team }
  },
  parent: async (ctx) => {
    const user = await findUserWithRolesOrThrow(ctx, ['PARENT'])
    return { user }
  },
  member: async (ctx) => {
    const team = await findTeamOrThrow(ctx)
    const user = await findUserWithRolesOrThrow(ctx, ['ADMIN', 'COACH', 'ATHLETE'], team.id)
    return { user, team }
  },
  any: async (ctx) => {
    const team = await findTeamOrThrow(ctx).catch(() => undefined)
    let user

    if (team) {
      user = await findUserWithRolesOrThrow(ctx, ['ADMIN', 'COACH', 'ATHLETE'], team.id).catch(() =>
        findUserWithRolesOrThrow(ctx, [])
      )
    } else {
      user = await findUserWithRolesOrThrow(ctx, [])
    }

    return { user, team }
  },
} satisfies Record<string, AuthFn>

type Auth = typeof Auth
type Context<K extends keyof Auth> = Awaited<ReturnType<Auth[K]>>
type Callback<P, A, C, I, R> = (obj: P, args: A, ctx: C, info: I) => MaybePromise<R>

export function withAuth<K extends keyof Auth, P, A, C extends ApolloContext, I, R>(
  role: K,
  callback: Callback<P, A, C & Context<K>, I, R>
) {
  const wrapper: Callback<P, A, C, I, R> = async (obj, args, ctx, info) => {
    try {
      const context = (await Auth[role](ctx)) as Context<K>
      return await callback(obj, args, { ...ctx, ...context }, info)
    } catch (error) {
      Logger.global.error('Error while auth route: %s', error)
      throw NotAuthorizedError
    }
  }

  return wrapper
}
