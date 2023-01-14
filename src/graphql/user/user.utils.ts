import { Prisma } from '@prisma/client'
import { UserOrder } from '../../types/graphql'

export function parseUserOrder(order: UserOrder | undefined | null) {
  if (!order) return

  const orderBy: Prisma.UserOrderByWithRelationInput = {}

  if (order.createdAt) orderBy.createdAt = order.createdAt
  if (order.email) orderBy.email = order.email
  if (order.name) orderBy.name = order.name

  return orderBy
}
