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
        Postmark.shared.send(Config.email.contact, 'email/contact.pug', input)
      },
    },
  },
})
