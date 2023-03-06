import SchemaBuilder from '@pothos/core'
import DataloaderPlugin from '@pothos/plugin-dataloader'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import WithInputPlugin from '@pothos/plugin-with-input'
import { DateTimeResolver } from 'graphql-scalars'
import { Context } from '../helpers/context'

type SchemaType = {
  Context: Context
  DefaultInputFieldRequiredness: true
  AuthScopes: {
    user: boolean
    staff: boolean
  }
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

export const builder = new SchemaBuilder<SchemaType>({
  defaultInputFieldRequiredness: true,
  plugins: [DataloaderPlugin, ScopeAuthPlugin, WithInputPlugin],
  authScopes: (context) => ({
    user: !!context.user,
    staff: !!context.user && !!context.user.roles.find((e) => e.type === 'STAFF'),
  }),
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

builder.addScalarType('DateTime', DateTimeResolver, {})

builder.queryType()
builder.mutationType()
