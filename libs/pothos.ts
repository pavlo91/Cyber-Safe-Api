import SchemaBuilder from '@pothos/core'
import DataloaderPlugin from '@pothos/plugin-dataloader'
import WithInputPlugin from '@pothos/plugin-with-input'
import { DateTimeResolver } from 'graphql-scalars'
import { Context } from '../utils/context'

type SchemaType = {
  Context: Context
  DefaultInputFieldRequiredness: true
  Scalars: {
    ID: {
      Input: string
      Output: string
    }
    DateTime: {
      Input: Date
      Output: Date
    }
  }
}

export type DefaultSchemaType = PothosSchemaTypes.ExtendDefaultTypes<SchemaType>

const pothos = new SchemaBuilder<SchemaType>({
  defaultInputFieldRequiredness: true,
  plugins: [DataloaderPlugin, WithInputPlugin],
  withInput: {
    typeOptions: {
      name: ({ parentTypeName, fieldName }) => {
        const capitalizedFieldName = `${fieldName[0].toUpperCase()}${fieldName.slice(1)}`

        if (parentTypeName === 'Query' || parentTypeName === 'Mutation') {
          return `${capitalizedFieldName}Input`
        }

        return `${parentTypeName}${capitalizedFieldName}Input`
      },
    },
  },
})

pothos.addScalarType('DateTime', DateTimeResolver, {})

pothos.queryType()
pothos.mutationType()

export default pothos
