import { Prisma } from '@prisma/client'
import { TeamOrder } from '../../types/graphql'

export function parseTeamOrder(order: TeamOrder | undefined | null) {
  if (!order) return

  const orderBy: Prisma.TeamOrderByWithRelationInput = {}

  if (order.createdAt) orderBy.createdAt = order.createdAt
  if (order.name) orderBy.name = order.name
  if (order.memberCount) orderBy.roles = { _count: order.memberCount }

  return orderBy
}
