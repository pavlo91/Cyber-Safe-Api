import { ArgBuilder, ObjectRef } from '@pothos/core'
import { builder, DefaultSchemaType } from './builder'

const DEFAULT_PAGE_SIZE = 15

type Page = {
  index: number
  size: number
  count: number
  total: number
}

type PageObject<T> = {
  page: Page
  nodes: T[]
}

export const Page = builder.objectRef<Page>('Page')

Page.implement({
  fields: (t) => ({
    index: t.exposeInt('index'),
    size: t.exposeInt('size'),
    count: t.exposeInt('count'),
    total: t.exposeInt('total'),
  }),
})

export function createPageObjectRef<T>(ref: ObjectRef<T>) {
  const ObjectPage = builder.objectRef<PageObject<T>>(ref.name + 'Page')

  ObjectPage.implement({
    fields: (t) => ({
      page: t.expose('page', {
        type: Page,
      }),
      nodes: t.expose('nodes', {
        type: [ref],
      }),
    }),
  })

  return ObjectPage
}

export const PageInput = builder.inputType('PageInput', {
  fields: (t) => ({
    index: t.int({ required: false }),
    size: t.int({ required: false }),
  }),
})

export function createPageArgs(arg: ArgBuilder<DefaultSchemaType>) {
  return {
    page: arg({ type: PageInput, required: false }),
  }
}

export async function createPage<T>(
  page: { index?: number | null; size?: number | null } | null | undefined,
  findManyAndCount: (args: { skip: number; take: number }) => Promise<[T[], number]>
) {
  const index = page?.index ?? 0
  const size = page?.size ?? DEFAULT_PAGE_SIZE

  const args = {
    skip: index * size,
    take: size,
  }

  const [nodes, total] = await findManyAndCount(args)
  const count = Math.ceil(total / size)

  return {
    page: { index, size, count, total },
    nodes,
  }
}
