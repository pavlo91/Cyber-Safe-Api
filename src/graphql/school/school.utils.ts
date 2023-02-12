import { Prisma } from '@prisma/client'
import { SchoolOrder } from '../../types/graphql'

export function parseSchoolOrder(order: SchoolOrder | undefined | null) {
  if (!order) return

  const orderBy: Prisma.SchoolOrderByWithRelationInput = {}

  if (order.createdAt) orderBy.createdAt = order.createdAt
  if (order.name) orderBy.name = order.name
  if (order.memberCount) orderBy.roles = { _count: order.memberCount }

  return orderBy
}

export function parseSchoolSearch(contains: string | undefined | null) {
  if (!contains) return

  const where: Prisma.SchoolWhereInput = {
    OR: [{ name: { contains, mode: 'insensitive' } }],
  }

  return where
}
