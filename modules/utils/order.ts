import { InputFieldBuilder, InputFieldMap, InputShapeFromFields, ObjectRef } from '@pothos/core'
import pothos, { DefaultSchemaType } from '../../libs/pothos'

export const GQLOrderDirectionEnum = pothos.enumType('OrderDirectionEnum', {
  values: ['ASC', 'DESC'] as const,
})

export type OrderDirectionEnum = 'ASC' | 'DESC'

function orderDirection(direction: OrderDirectionEnum | undefined | null) {
  if (direction === undefined || direction === null) return undefined
  return direction === 'ASC' ? 'asc' : 'desc'
}

type OrderDirection = ReturnType<typeof orderDirection>

function createBuilder(t: InputFieldBuilder<DefaultSchemaType, 'InputObject'>) {
  return {
    order: () => t.field({ type: GQLOrderDirectionEnum, required: false }),
  }
}

type CreateBuilder = ReturnType<typeof createBuilder>

export function createOrderInput<TFields extends InputFieldMap, TFilter>(
  ref: ObjectRef<any>,
  fields: (t: CreateBuilder) => TFields,
  filter: (values: { [K in keyof TFields]: OrderDirection }) => TFilter
) {
  const ObjectOrder = pothos.inputRef<InputShapeFromFields<TFields>>(ref.name + 'Order')

  ObjectOrder.implement({
    // @ts-ignore
    fields: (t) => fields(createBuilder(t)),
  })

  return Object.assign(ObjectOrder, {
    toOrder: (values: InputShapeFromFields<TFields> | undefined | null) => {
      if (values) {
        return filter(
          //@ts-ignore
          Object.fromEntries(
            Object.entries(values).map(
              ([key, value]) => [key as keyof TFields, orderDirection(value as OrderDirectionEnum)] as const
            )
          )
        )
      }

      return undefined
    },
  })
}
