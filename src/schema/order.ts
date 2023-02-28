import { builder } from './builder'

export const OrderDirectionEnum = builder.enumType('OrderDirectionEnum', {
  values: ['ASC', 'DESC'] as const,
})

export type OrderDirectionEnum = 'ASC' | 'DESC'

function orderDirection(direction: OrderDirectionEnum) {
  return direction === 'ASC' ? 'asc' : 'desc'
}

export function createOrderInput<T extends Record<string, (dir: 'asc' | 'desc') => object>>(name: string, args: T) {
  const ObjectOrder = builder.inputRef<{ [K in keyof T]: OrderDirectionEnum }>(name + 'Order')

  ObjectOrder.implement({
    fields: (t) =>
      Object.keys(args).reduce((fields: any, key) => {
        fields[key] = t.field({ type: OrderDirectionEnum, required: false })
        return fields
      }, {}),
  })

  return Object.assign(ObjectOrder, {
    toOrder: (input: { [K in keyof T]: OrderDirectionEnum } | undefined | null) => {
      if (input) {
        const keys = Object.keys(input)
        const key = keys.find((key) => typeof input[key] === 'string')

        if (key) {
          return args[key](orderDirection(input[key])) as ReturnType<T[keyof T]>
        }
      }

      return undefined
    },
  })
}
