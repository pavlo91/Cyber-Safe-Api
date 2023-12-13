import { Prisma, Resource } from '@prisma/client'
import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import storage from '../libs/storage'
import { checkAuth, isStaff } from '../utils/auth'
import { GQLCategory } from './category'
import { GQLUser } from './user'
import { createFilterInput } from './utils/filter'
import { createOrderInput } from './utils/order'
import { createPage, createPageArgs, createPageObjectRef } from './utils/page'

export const GQLResource = pothos.objectRef<Resource>('Resource')
export const GQLResourcePage = createPageObjectRef(GQLResource)

export const ResourceOrder = createOrderInput(
  GQLResource,
  (t) => ({
    createdAt: t.order(),
    title: t.order(),
    subTitle: t.order(),
    url: t.order(),
  }),
  ({ createdAt, title, subTitle, url }) => {
    const orderBy: Prisma.ResourceOrderByWithRelationInput[] = []

    if (createdAt) orderBy.push({ createdAt })
    if (title) orderBy.push({ title })
    if (subTitle) orderBy.push({ subTitle })
    if (url) orderBy.push({ url })

    return orderBy
  }
)

export const ResourceFilter = createFilterInput(
  GQLResource,
  (t) => ({
    search: t.string({ required: false }),
  }),
  ({ search }) => {
    const where: Prisma.ResourceWhereInput = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subTitle: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ]
    }

    return where
  }
)

GQLResource.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    subTitle: t.exposeString('subTitle'),
    url: t.exposeString('url'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    user: t.field({
      type: GQLUser,
      nullable: false,
      resolve: (resource) => resource.userId,
    }),
    category: t.field({
      type: GQLCategory,
      nullable: false,
      resolve: (resource) => resource.categoryId,
    }),
  }),
})

pothos.queryFields((t) => ({
  resources: t.field({
    type: GQLResourcePage,
    args: {
      ...createPageArgs(t.arg),
      order: t.arg({ type: ResourceOrder, required: false }),
      filter: t.arg({ type: ResourceFilter, required: false }),
    },
    resolve: async (obj, { page, order, filter }, { user }) => {
      await checkAuth(() => isStaff(user))

      const where = ResourceFilter.toFilter(filter)
      const orderBy = ResourceOrder.toOrder(order)

      return await createPage(page, (args) =>
        prisma.$transaction([prisma.resource.findMany({ ...args, where, orderBy }), prisma.resource.count({ where })])
      )
    },
  }),
}))

pothos.mutationFields((t) => ({
  createResource: t.fieldWithInput({
    type: GQLResource,
    input: {
      title: t.input.string(),
      subTitle: t.input.string(),
      url: t.input.string(),
      category: t.input.string(),
      uploadType: t.input.string(),
      uploadId: t.input.string({ required: false }),
    },
    resolve: async (obj, { input }, { user }) => {
      await checkAuth(() => isStaff(user))

      let blobUrl = ''

      if (input.uploadType === 'File' && input.uploadId) {
        const upload = await prisma.upload.findUniqueOrThrow({ where: { id: input.uploadId } })

        const blobName = storage.getRandomBlobName('uploads', 'resources')
        const blob = await storage.moveBlob(upload.blobURL, 'public', blobName)

        blobUrl = blob.blobURL
      }

      return await prisma.resource.create({
        data: {
          title: input.title,
          subTitle: input.subTitle,
          url: input.uploadType === 'URL' ? input.url : blobUrl,
          categoryId: input.category,
          userId: user!.id,
        },
      })
    },
  }),
}))
