import Prisma from '@prisma/client'
import { hasRoleInSchoolId, isSameUserId } from '../helpers/auth'
import { prisma } from '../prisma'
import { Address } from './address'
import { builder } from './builder'
import { Image } from './image'
import { createPage, createPageArgs, createPageObjectRef } from './page'

export const School = builder.objectRef<Prisma.School>('School')
export const SchoolPage = createPageObjectRef(School)

School.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    address: t.field({
      type: Address,
      nullable: true,
      resolve: (school) => school.addressId,
    }),
    logo: t.field({
      type: Image,
      nullable: true,
      resolve: (school) => school.logoId,
    }),
    cover: t.field({
      type: Image,
      nullable: true,
      resolve: (school) => school.coverId,
    }),
  }),
})

builder.queryFields((t) => ({
  schools: t.field({
    authScopes: {
      staff: true,
    },
    type: SchoolPage,
    args: {
      ...createPageArgs(t.arg),
    },
    resolve: (obj, { page }) => {
      return createPage(page, (args) =>
        prisma.$transaction([prisma.school.findMany({ ...args }), prisma.school.count()])
      )
    },
  }),
  school: t.field({
    authScopes: (obj, { id }, { user }) => {
      if (hasRoleInSchoolId(id, user)) {
        return true
      }

      return { staff: true }
    },
    type: School,
    args: {
      id: t.arg.id(),
    },
    resolve: (obj, { id }) => {
      return prisma.school.findUniqueOrThrow({
        where: { id },
      })
    },
  }),
}))

builder.mutationFields((t) => ({
  createSchool: t.fieldWithInput({
    authScopes: (obj, { input: { userId } }, { user }) => {
      if (userId && isSameUserId(userId, user)) {
        return true
      }

      return { staff: true }
    },
    type: School,
    input: {
      userId: t.input.id({ required: false }),
      name: t.input.string(),
      phone: t.input.string({ required: false }),
    },
    resolve: (obj, { input }) => {
      return prisma.$transaction(async (prisma) => {
        const school = await prisma.school.create({
          data: {
            name: input.name,
            phone: input.phone,
          },
        })

        if (input.userId) {
          await prisma.userRole.create({
            include: {
              user: true,
              schoolRole: { include: { school: true } },
              parentRole: { include: { childUser: true } },
            },
            data: {
              type: 'ADMIN',
              userId: input.userId,
              schoolRole: { create: { schoolId: school.id } },
            },
          })
        }

        return school
      })
    },
  }),
  updateSchool: t.fieldWithInput({
    authScopes: (obj, { id }, { user }) => {
      if (hasRoleInSchoolId(id, user, ['ADMIN', 'COACH'])) {
        return true
      }

      return { staff: true }
    },
    type: School,
    args: {
      id: t.arg.id(),
    },
    input: {
      name: t.input.string({ required: false }),
      phone: t.input.string({ required: false }),
      logo: t.input.string({ required: false }),
      cover: t.input.string({ required: false }),
    },
    resolve: (obj, { id, input }) => {
      return prisma.school.update({
        where: { id },
        data: {
          name: input.name ?? undefined,
          phone: input.phone,
        },
      })
    },
  }),
}))
