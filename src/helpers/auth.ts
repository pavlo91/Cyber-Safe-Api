import { Prisma, Role } from '@prisma/client'
import { SchoolInclude } from '../graphql/school/school.include'
import { UserInclude } from '../graphql/user/user.include'
import { ApolloContext } from '../types/apollo'
import { parseJwt } from '../utils/crypto'
import { Logger } from '../utils/logger'
import { NotAuthorizedError } from './errors'

function findSchoolOrThrow({ req, prisma }: ApolloContext) {
  const id = req.headers['x-school-id']

  if (typeof id !== 'string') {
    throw new Error('No x-school-id found in headers')
  }

  return prisma.school.findUniqueOrThrow({
    where: { id },
    include: SchoolInclude,
  })
}

function findUserWithRolesOrThrow({ req, prisma }: ApolloContext, roles: Role[], schoolId?: string) {
  const token = req.headers['x-token']

  if (typeof token !== 'string') {
    throw new Error('No x-token found in headers')
  }

  const { uuid } = parseJwt(token)

  const OR: Prisma.UserRoleWhereInput[] = []

  roles.forEach((role) => {
    const where: Prisma.UserRoleWhereInput = { role }

    if (!!schoolId) {
      where.schoolRole = { schoolId }
    }

    OR.push(where)
  })

  if (OR.length > 0) {
    if (!OR.find((e) => e.role === 'STAFF')) {
      OR.push({ role: 'STAFF' })
    }

    // Make them all accepted
    OR.forEach((or) => {
      or.status = 'ACCEPTED'
    })
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

  return prisma.user.findFirstOrThrow({
    where,
    include: include as typeof UserInclude,
  })
}

type AuthFn = (ctx: ApolloContext) => Promise<any>

const Auth = {
  staff: async (ctx) => {
    const user = await findUserWithRolesOrThrow(ctx, ['STAFF'])
    return { user }
  },
  admin: async (ctx) => {
    const school = await findSchoolOrThrow(ctx)
    const user = await findUserWithRolesOrThrow(ctx, ['ADMIN'], school.id)
    return { user, school }
  },
  coach: async (ctx) => {
    const school = await findSchoolOrThrow(ctx)
    const user = await findUserWithRolesOrThrow(ctx, ['ADMIN', 'COACH'], school.id)
    return { user, school }
  },
  athlete: async (ctx) => {
    const school = await findSchoolOrThrow(ctx)
    const user = await findUserWithRolesOrThrow(ctx, ['ATHLETE'], school.id)
    return { user, school }
  },
  parent: async (ctx) => {
    const user = await findUserWithRolesOrThrow(ctx, ['PARENT'])

    const checkChild = (childId: string) => {
      if (
        !user.roles.find(
          (e) => e.role === 'PARENT' && e.status === 'ACCEPTED' && e.parentRole && e.parentRole.childUserId === childId
        )
      ) {
        throw new Error('You are not a parent of this child')
      }
    }

    return { user, checkChild }
  },
  member: async (ctx) => {
    const school = await findSchoolOrThrow(ctx)
    const user = await findUserWithRolesOrThrow(ctx, ['ADMIN', 'COACH', 'ATHLETE'], school.id)
    return { user, school }
  },
  any: async (ctx) => {
    const school = await findSchoolOrThrow(ctx).catch(() => undefined)
    let user

    if (school) {
      user = await findUserWithRolesOrThrow(ctx, ['ADMIN', 'COACH', 'ATHLETE'], school.id).catch(() =>
        findUserWithRolesOrThrow(ctx, [])
      )
    } else {
      user = await findUserWithRolesOrThrow(ctx, [])
    }

    return { user, school }
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
    const context = await Auth[role](ctx).catch((error) => {
      Logger.global.error('Error while authorizing route: %s', error)
      throw NotAuthorizedError
    })

    return await callback(obj, args, { ...ctx, ...(context as Context<K>) }, info)
  }

  return wrapper
}
