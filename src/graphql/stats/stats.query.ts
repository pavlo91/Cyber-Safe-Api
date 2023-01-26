import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

type StatsByDay = {
  day: string
  value: number
}

async function getStatsByDay(days: number, findMany: (startDate: Date) => Promise<StatsByDay[]>) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(0, 0, 0, 0)

  const data = await findMany(date)
  const result: StatsByDay[] = []

  for (let i = 0; i < days; i++) {
    date.setDate(date.getDate() + 1)
    const item = data.find((e) => date.toISOString().startsWith(e.day))

    result.push({
      day: date.toISOString(),
      value: item?.value ?? 0,
    })
  }

  return result
}

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
        return getStatsByDay(
          days,
          (startDate) =>
            prisma.$queryRaw`
              SELECT
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "User"
              WHERE "createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `
        )
      }),
    },
  },
})
