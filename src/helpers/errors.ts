import { GraphQLError } from 'graphql'

export const NotAuthorizedError = new GraphQLError('Not Authorized', {
  extensions: {
    code: 'NOT_AUTHORIZED',
  },
})

export const UserNotFoundError = new GraphQLError('User was not found', {
  extensions: {
    code: 'USER_NOT_FOUND',
  },
})
