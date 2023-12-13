import { Category } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { checkAuth, isStaff } from '../utils/auth'

export const GQLCategory = pothos.loadableObjectRef<Category, string>('Category', {
  load: async (keys) => {
    const categories = await prisma.category.findMany({ where: { id: { in: keys } } })
    return keys.map((key) => categories.find((category) => category.id === key)!)
  },
})

GQLCategory.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
  }),
})

pothos.queryFields((t) => ({
  categories: t.field({
    type: [GQLCategory],
    resolve: () => {
      return prisma.category.findMany()
    },
  }),
}))

pothos.mutationFields((t) => ({
  createCategory: t.fieldWithInput({
    type: GQLCategory,
    input: {
      name: t.input.string(),
    },
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(() => isStaff(user))

      return await prisma.category.create({
        data: {
          name: input.name ?? undefined,
        },
      })
    },
  }),
  updateCategory: t.fieldWithInput({
    type: GQLCategory,
    args: {
      id: t.arg.id(),
    },
    input: {
      name: t.input.string({ required: false }),
    },
    resolve: async (obj, { id, input }, { user }) => {
      await checkAuth(() => isStaff(user))

      return await prisma.category.update({
        where: { id },
        data: {
          name: input.name ?? undefined,
        },
      })
    },
  }),
  removeCategory: t.boolean({
    args: {
      id: t.arg.id(),
    },
    resolve: async (obj, { id }, { user }) => {
      await checkAuth(() => isStaff(user))

      await prisma.category.delete({ where: { id } })

      return true
    },
  }),
}))