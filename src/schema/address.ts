import Prisma from '@prisma/client'
import { hasRoleInSchoolId } from '../helpers/auth'
import { prisma } from '../prisma'
import { builder } from './builder'

export const Address = builder.loadableObjectRef<Prisma.Address, string>('Address', {
  load: async (keys) => {
    const addresses = await prisma.address.findMany({ where: { id: { in: keys } } })
    return keys.map((key) => addresses.find((address) => address.id === key)!)
  },
})

Address.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    street: t.exposeString('street'),
    city: t.exposeString('city'),
    state: t.exposeString('state'),
    zip: t.exposeString('zip'),
    formatted: t.string({
      resolve: (address) => {
        return [address.street, address.city, address.state, address.zip].join(', ')
      },
    }),
  }),
})

builder.mutationFields((t) => ({
  createAddress: t.fieldWithInput({
    authScopes: (obj, { schoolId }, { user }) => {
      if (hasRoleInSchoolId(schoolId, user, ['ADMIN', 'COACH'])) {
        return true
      }

      return { staff: true }
    },
    type: Address,
    args: {
      schoolId: t.arg.id(),
    },
    input: {
      street: t.input.string(),
      city: t.input.string(),
      state: t.input.string(),
      zip: t.input.string(),
    },
    resolve: (obj, { schoolId, input }) => {
      return prisma.address.create({
        data: {
          school: { connect: { id: schoolId } },
          street: input.street ?? undefined,
          city: input.city ?? undefined,
          state: input.state ?? undefined,
          zip: input.zip ?? undefined,
        },
      })
    },
  }),
  updateAddress: t.fieldWithInput({
    authScopes: async (obj, { id }, { user }) => {
      const address = await prisma.address.findUniqueOrThrow({
        where: { id },
        include: { school: true },
      })

      if (address.school && hasRoleInSchoolId(address.school.id, user, ['ADMIN', 'COACH'])) {
        return true
      }

      return { staff: true }
    },
    type: Address,
    args: {
      id: t.arg.id(),
    },
    input: {
      street: t.input.string({ required: false }),
      city: t.input.string({ required: false }),
      state: t.input.string({ required: false }),
      zip: t.input.string({ required: false }),
    },
    resolve: (obj, { id, input }) => {
      return prisma.address.update({
        where: { id },
        data: {
          street: input.street ?? undefined,
          city: input.city ?? undefined,
          state: input.state ?? undefined,
          zip: input.zip ?? undefined,
        },
      })
    },
  }),
  removeAddress: t.boolean({
    authScopes: async (obj, { id }, { user }) => {
      const address = await prisma.address.findUniqueOrThrow({
        where: { id },
        include: { school: true },
      })

      if (address.school && hasRoleInSchoolId(address.school.id, user, ['ADMIN', 'COACH'])) {
        return true
      }

      return { staff: true }
    },
    args: {
      id: t.arg.id(),
    },
    resolve: (obj, { id }) => {
      return prisma.address.delete({ where: { id } }).then(() => true)
    },
  }),
}))
