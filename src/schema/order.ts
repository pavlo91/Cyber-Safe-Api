import { builder } from './builder'

export const OrderDirectionEnum = builder.enumType('OrderDirectionEnum', {
  values: ['ASC', 'DESC'] as const,
})

export type OrderDirectionEnum = 'ASC' | 'DESC'

export function orderDirection(direction: OrderDirectionEnum | undefined | null) {
  if (typeof direction === 'string') {
    return direction === 'ASC' ? 'asc' : 'desc'
  }

  return undefined
}
