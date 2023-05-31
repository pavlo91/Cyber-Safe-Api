import { InputFieldBuilder, InputFieldMap, InputShapeFromFields, ObjectRef } from '@pothos/core'
import pothos, { DefaultSchemaType } from '../../libs/pothos'

export function createFilterInput<TFields extends InputFieldMap, TFilter>(
  ref: ObjectRef<any>,
  fields: (t: InputFieldBuilder<DefaultSchemaType, 'InputObject'>) => TFields,
  filter: (values: InputShapeFromFields<TFields>) => TFilter
) {
  const ObjectFilter = pothos.inputRef<InputShapeFromFields<TFields>>(ref.name + 'Filter')

  ObjectFilter.implement({
    // @ts-ignore
    fields: (t) => fields(t),
  })

  return Object.assign(ObjectFilter, {
    toFilter: (values: InputShapeFromFields<TFields> | undefined | null) => {
      if (values) {
        return filter(values)
      }
      return undefined
    },
  })
}
