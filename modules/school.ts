import { Prisma, School } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { checkAuth, hasRoleInSchool, isSameUser, isStaff } from '../utils/auth'
import { randomToken } from '../utils/crypto'
import { sendUserRoleConfirmationEmail } from '../utils/email'
import { GQLAddress } from './address'
import { GQLImage } from './image'
import { GQLUserRoleStatusEnum } from './user-role'
import { createFilterInput } from './utils/filter'
import { createOrderInput } from './utils/order'
import { createPage, createPageArgs, createPageObjectRef } from './utils/page'

export const GQLSchool = pothos.objectRef<School>('School')
export const GQLSchoolPage = createPageObjectRef(GQLSchool)

export const SchoolOrder = createOrderInput(
  GQLSchool,
  (t) => ({
    createdAt: t.order(),
    name: t.order(),
    phone: t.order(),
    memberCount: t.order(),
    address: t.order(),
  }),
  ({ createdAt, name, phone, memberCount, address }) => {
    const orderBy: Prisma.SchoolOrderByWithRelationInput[] = []

    if (createdAt) orderBy.push({ createdAt })
    if (name) orderBy.push({ name })
    if (phone) orderBy.push({ phone })
    if (memberCount) orderBy.push({ roles: { _count: memberCount } })
    if (address) {
      orderBy.push(
        { address: { street: address } },
        { address: { city: address } },
        { address: { state: address } },
        { address: { zip: address } }
      )
    }

    return orderBy
  }
)

export const SchoolFilter = createFilterInput(
  GQLSchool,
  (t) => ({
    search: t.string({ required: false }),
  }),
  ({ search }) => {
    const where: Prisma.SchoolWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    return where
  }
)

GQLSchool.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    phone: t.exposeString('phone', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    address: t.field({
      type: GQLAddress,
      nullable: true,
      resolve: (school) => school.addressId,
    }),
    logo: t.field({
      type: GQLImage,
      nullable: true,
      resolve: (school) => school.logoId,
    }),
    cover: t.field({
      type: GQLImage,
      nullable: true,
      resolve: (school) => school.coverId,
    }),
    memberCount: t.int({
      args: {
        status: t.arg({ type: GQLUserRoleStatusEnum, required: false }),
      },
      resolve: async (school, { status }) => {
        return prisma.userRole.count({
          where: {
            status: status ?? undefined,
            schoolRole: { schoolId: school.id },
            type: { in: ['ADMIN', 'COACH', 'STUDENT'] },
          },
        })
      },
    }),
  }),
})

pothos.queryFields((t) => ({
  schools: t.field({
    type: GQLSchoolPage,
    args: {
      ...createPageArgs(t.arg),
      order: t.arg({ type: SchoolOrder, required: false }),
      filter: t.arg({ type: SchoolFilter, required: false }),
    },
    resolve: async (obj, { page, order, filter }, { user }) => {
      await checkAuth(() => isStaff(user))

      const where = SchoolFilter.toFilter(filter)
      const orderBy = SchoolOrder.toOrder(order)

      return await createPage(page, (args) =>
        prisma.$transaction([prisma.school.findMany({ ...args, where, orderBy }), prisma.school.count({ where })])
      )
    },
  }),
  school: t.field({
    type: GQLSchool,
    args: {
      id: t.arg.id(),
    },
    resolve: async (obj, { id }, { user }) => {
      await checkAuth(
        () => hasRoleInSchool(id, user),
        () => isStaff(user)
      )

      return await prisma.school.findUniqueOrThrow({
        where: { id },
      })
    },
  }),
}))

pothos.mutationFields((t) => ({
  createSchool: t.fieldWithInput({
    type: GQLSchool,
    input: {
      userId: t.input.id({ required: false }),
      name: t.input.string(),
      phone: t.input.string({ required: false }),
    },
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(
        () => !!input.userId && isSameUser(input.userId, user),
        () => isStaff(user)
      )

      return await prisma.$transaction(async (prisma) => {
        const school = await prisma.school.create({
          data: {
            name: input.name,
            phone: input.phone,
          },
        })

        if (input.userId) {
          const userRole = await prisma.userRole.create({
            include: {
              user: true,
              schoolRole: { include: { school: true } },
              parentRole: { include: { childUser: true } },
            },
            data: {
              type: 'ADMIN',
              userId: input.userId,
              statusToken: randomToken(),
              schoolRole: { create: { schoolId: school.id } },
            },
          })

          sendUserRoleConfirmationEmail(userRole)
        }

        return school
      })
    },
  }),
  updateSchool: t.fieldWithInput({
    type: GQLSchool,
    args: {
      id: t.arg.id(),
    },
    input: {
      name: t.input.string({ required: false }),
      phone: t.input.string({ required: false }),
      logo: t.input.string({ required: false }),
      cover: t.input.string({ required: false }),
    },
    resolve: async (obj, { id, input }, { user }) => {
      await checkAuth(
        () => hasRoleInSchool(id, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      return await prisma.school.update({
        where: { id },
        data: {
          name: input.name ?? undefined,
          phone: input.phone,
        },
      })
    },
  }),
}))
