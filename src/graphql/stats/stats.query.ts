import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

type StatByDay = {
  day: string
  value: number
}

async function getStatsByDay(days: number, findMany: (startDate: Date) => Promise<StatByDay[]>) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setUTCHours(0, 0, 0, 0)

  const data = await findMany(date)
  const result: StatByDay[] = []

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
    type StatByDay {
      day: DateTime!
      value: Int!
    }

    extend type Query {
      statsOfCreatedUsers(days: Int = 15): [StatByDay!]!
      statsOfCreatedTeams(days: Int = 15): [StatByDay!]!
      statsOfCreatedMembers(days: Int = 15): [StatByDay!]!
      statsOfCreatedParents(days: Int = 15): [StatByDay!]!
    }
  `,
  resolvers: {
    Query: {
      statsOfCreatedUsers: withAuth('staff', (obj, { days }, { prisma }, info) => {
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
      statsOfCreatedTeams: withAuth('staff', (obj, { days }, { prisma }, info) => {
        return getStatsByDay(
          days,
          (startDate) =>
            prisma.$queryRaw`
              SELECT
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "Team"
              WHERE "createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `
        )
      }),
      statsOfCreatedMembers: withAuth('staff', (obj, { days }, { prisma }, info) => {
        return getStatsByDay(
          days,
          (startDate) =>
            prisma.$queryRaw`
              SELECT
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "TeamUserRole"
              WHERE "createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `
        )
      }),
      statsOfCreatedParents: withAuth('staff', (obj, { days }, { prisma }, info) => {
        return getStatsByDay(
          days,
          (startDate) =>
            prisma.$queryRaw`
              SELECT
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "ParentUserRole"
              WHERE "createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `
        )
      }),
    },
  },
})
