import { Prisma } from '@prisma/client'
import { UserInclude } from '../graphql/user/user.include'
import { ApolloContext } from '../types/apollo'
import { parseJwt } from '../utils/crypto'

function findUser(ctx: ApolloContext, id?: string) {
  const token = ctx.req.headers['x-token']

  const where: Prisma.UserWhereInput = {}

  if (typeof id === 'string') {
    where.id = id
  } else if (typeof token === 'string') {
    const jwt = parseJwt(token)
    where.uuid = jwt.uuid
  } else {
    throw ''
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

    if (!user.roles.find((e) => e.role === 'STAFF')) {
      throw ''
    }

    if (typeof behalfId === 'string') {
      user = await findUser(ctx, behalfId)
    }

    return { user }
  },
  coach: async (ctx: ApolloContext, user: User) => {
    const orgId = ctx.req.headers['x-org-id']
    if (typeof orgId !== 'string') throw ''

    const role = user.roles.find((e) => e.role === 'COACH' && e.teamRole && e.teamRole.team.id === orgId)
    if (!role) throw new Error('')

    const team = role.teamRole!.team

    return { user, team }
  },
  athlete: (ctx: ApolloContext, user: User) => {
    const orgId = ctx.req.headers['x-org-id']
    if (typeof orgId !== 'string') throw ''

    const role = user.roles.find((e) => e.role === 'ATHLETE' && e.teamRole && e.teamRole.team.id === orgId)
    if (!role) throw new Error('')

    const team = role.teamRole!.team

    return { user, team }
  },
  parent: (ctx: ApolloContext, user: User) => {
    const roles = user.roles.filter((e) => e.role === 'PARENT' && e.parentRole)

    if (roles.length === 0) {
      throw new Error('')
    }

    const children = roles.map((e) => e.parentRole)

    return { user, children }
  },
  any: (ctx: ApolloContext, user: User) => {
    return { user }
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
    const user = await findUser(ctx)

    const currentUser = await UserRole.staff(ctx, user)
      .then((e) => e.user)
      .catch(() => user)

    const context = (await UserRole[role](ctx, currentUser)) as Context<Role>

    return await callback(obj, args, { ...ctx, ...context }, info)
  }

  return wrapper
}
