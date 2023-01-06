import { PrismaSelect } from '@paljs/plugins'
import { Prisma } from '@prisma/client'
import { GraphQLResolveInfo } from 'graphql'
import { InputMaybe, Page } from '../types/graphql'

export function select(info: GraphQLResolveInfo, modelName: Prisma.ModelName, field?: string) {
  const select = new PrismaSelect(info)

  if (field) {
    return select.valueOf(field, modelName)
  }

  return select.valueWithFilter(modelName)
}

export async function paginated<T>(
  page: InputMaybe<Page>,
  findManyAndCount: (args: { skip: number; take: number }) => Promise<[T[], number]>
) {
  const index = page?.index ?? 0
  const size = page?.size ?? 10

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
