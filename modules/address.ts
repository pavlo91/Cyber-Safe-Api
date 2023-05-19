import { Address } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { checkAuth, hasRoleInSchool, isStaff } from '../utils/auth'

export const GQLAddress = pothos.loadableObjectRef<Address, string>('Address', {
  load: async (keys) => {
    const addresses = await prisma.address.findMany({ where: { id: { in: keys } } })
    return keys.map((key) => addresses.find((address) => address.id === key)!)
  },
})

GQLAddress.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    street: t.exposeString('street'),
    city: t.exposeString('city'),
    state: t.exposeString('state'),
    zip: t.exposeString('zip'),
    formatted: t.string({
      resolve: (address) => {
        return [address.street, address.city, [address.state, address.zip].join(' ')].join(', ')
      },
    }),
  }),
})

pothos.mutationFields((t) => ({
  createAddress: t.fieldWithInput({
    type: GQLAddress,
    args: {
      schoolId: t.arg.id(),
    },
    input: {
      street: t.input.string(),
      city: t.input.string(),
      state: t.input.string(),
      zip: t.input.string(),
    },
    resolve: async (obj, { schoolId, input }, { user }) => {
      await checkAuth(
        () => hasRoleInSchool(schoolId, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      return await prisma.address.create({
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
    type: GQLAddress,
    args: {
      id: t.arg.id(),
    },
    input: {
      street: t.input.string({ required: false }),
      city: t.input.string({ required: false }),
      state: t.input.string({ required: false }),
      zip: t.input.string({ required: false }),
    },
    resolve: async (obj, { id, input }, { user }) => {
      const address = await prisma.address.findFirstOrThrow({
        where: { id, school: { isNot: null } },
        include: { school: true },
      })

      await checkAuth(
        () => hasRoleInSchool(address.school!.id, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      return await prisma.address.update({
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
    args: {
      id: t.arg.id(),
    },
    resolve: async (obj, { id }, { user }) => {
      const address = await prisma.address.findFirstOrThrow({
        where: { id, school: { isNot: null } },
        include: { school: true },
      })

      await checkAuth(
        () => hasRoleInSchool(address.school!.id, user, ['ADMIN', 'COACH']),
        () => isStaff(user)
      )

      await prisma.address.delete({ where: { id } })

      return true
    },
  }),
}))
