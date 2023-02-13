import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { Config } from '../../config'
import { Postmark } from '../../libs/postmark'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      contact(input: ContactInput!): ID
    }
  `,
  resolvers: {
    Mutation: {
      contact(obj, { input }, ctx, info) {
        const to = Config.email.contact.split(',')
        Postmark.shared.sendMany(to, 'email/contact.pug', input)
      },
    },
  },
})
