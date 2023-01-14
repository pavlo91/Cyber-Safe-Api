import { Page } from '../types/graphql'

const DEFAULT_PAGE_SIZE = 15

export async function paginated<T>(
  page: Page | undefined | null,
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
