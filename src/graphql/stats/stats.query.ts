import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: gql`
    type StatsByDay {
      day: DateTime!
      value: Int!
    }

    extend type Query {
      statsByCreatedUsers(days: Int = 30): [StatsByDay!]!
    }
  `,
  resolvers: {
    Query: {
      statsByCreatedUsers: withAuth('staff', (obj, { days }, { prisma }, info) => {
        const date = new Date()
        date.setDate(date.getDate() - days)

        return prisma.$queryRaw`
          SELECT
            CONCAT(TO_CHAR("createdAt", 'YYYY-MM-DD'), 'T00:00:00.000Z') AS day,
            CAST(COUNT(*) AS INTEGER) AS value
          FROM "User"
          WHERE "createdAt" >= ${date}
          GROUP BY day
          ORDER BY day DESC
        `
      }),
    },
  },
})
