import { Prisma } from '@prisma/client'
import { UserOrder } from '../../types/graphql'

export function parseUserOrder(order: UserOrder | undefined | null) {
  if (!order) return

  const orderBy: Prisma.UserOrderByWithRelationInput = {}

  if (order.createdAt) orderBy.createdAt = order.createdAt
  if (order.email) orderBy.email = order.email
  if (order.name) orderBy.name = order.name
  if (order.parentCount) orderBy.parentRoles = { _count: order.parentCount }

  return orderBy
}

export function parseUserSearch(contains: string | undefined | null) {
  if (!contains) return

  const where: Prisma.UserWhereInput = {
    OR: [{ email: { contains, mode: 'insensitive' } }, { name: { contains, mode: 'insensitive' } }],
  }

  return where
}
