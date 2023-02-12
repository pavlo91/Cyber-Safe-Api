import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

type StatByDay = {
  day: string
  value: number
}

async function getStatsByDay(days: number, findManyAndCount: (startDate: Date) => Promise<[StatByDay[], number]>) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setUTCHours(0, 0, 0, 0)

  const [data, total] = await findManyAndCount(date)
  const stats: StatByDay[] = []

  for (let i = 0; i < days; i++) {
    date.setDate(date.getDate() + 1)
    const item = data.find((e) => date.toISOString().startsWith(e.day))

    stats.push({
      day: date.toISOString(),
      value: item?.value ?? 0,
    })
  }

  return { stats, total }
}

export default createGraphQLModule({
  typeDefs: gql`
    type StatByDay {
      day: DateTime!
      value: Int!
    }

    type StatsByDay {
      stats: [StatByDay!]!
      total: Int!
    }

    extend type Query {
      statsOfCreatedUsers(days: Int = 15): StatsByDay!
      statsOfCreatedSchools(days: Int = 15): StatsByDay!
      statsOfCreatedMembers(days: Int = 15): StatsByDay!
      statsOfCreatedParents(days: Int = 15): StatsByDay!
      # Admin + Coach
      statsOfCreatedMembersInSchool(days: Int = 15): StatsByDay!
      statsOfInvitedMembersInSchool(days: Int = 15): StatsByDay!
      statsOfAcceptedMembersInSchool(days: Int = 15): StatsByDay!
    }
  `,
  resolvers: {
    Query: {
      statsOfCreatedUsers: withAuth('staff', (obj, { days }, { prisma }, info) => {
        return getStatsByDay(days, (startDate) =>
          prisma.$transaction([
            prisma.$queryRaw`
              SELECT
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "User"
              WHERE "emailConfirmed" = TRUE AND "createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `,
            prisma.user.count({
              where: { emailConfirmed: true },
            }),
          ])
        )
      }),
      statsOfCreatedSchools: withAuth('staff', (obj, { days }, { prisma }, info) => {
        return getStatsByDay(days, (startDate) =>
          prisma.$transaction([
            prisma.$queryRaw`
              SELECT
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "School"
              WHERE "createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `,
            prisma.school.count(),
          ])
        )
      }),
      statsOfCreatedMembers: withAuth('staff', (obj, { days }, { prisma }, info) => {
        return getStatsByDay(days, (startDate) =>
          prisma.$transaction([
            prisma.$queryRaw`
              SELECT
                TO_CHAR("SchoolUserRole"."createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "SchoolUserRole"
              LEFT JOIN "UserRole" ON "SchoolUserRole"."userRoleId" = "UserRole"."id"
              WHERE "UserRole"."status" = 'ACCEPTED' AND "SchoolUserRole"."createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `,
            prisma.schoolUserRole.count({
              where: { userRole: { status: 'ACCEPTED' } },
            }),
          ])
        )
      }),
      statsOfCreatedParents: withAuth('staff', (obj, { days }, { prisma }, info) => {
        return getStatsByDay(days, (startDate) =>
          prisma.$transaction([
            prisma.$queryRaw`
              SELECT
                TO_CHAR("ParentUserRole"."createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "ParentUserRole"
              LEFT JOIN "UserRole" ON "ParentUserRole"."userRoleId" = "UserRole"."id"
              WHERE "UserRole"."status" = 'ACCEPTED' AND "ParentUserRole"."createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `,
            prisma.parentUserRole.count({
              where: { userRole: { status: 'ACCEPTED' } },
            }),
          ])
        )
      }),
      statsOfCreatedMembersInSchool: withAuth('coach', (obj, { days }, { prisma, school }, info) => {
        return getStatsByDay(days, (startDate) =>
          prisma.$transaction([
            prisma.$queryRaw`
              SELECT
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "SchoolUserRole"
              WHERE "schoolId" = ${school.id} AND "createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `,
            prisma.schoolUserRole.count({
              where: { schoolId: school.id },
            }),
          ])
        )
      }),
      statsOfInvitedMembersInSchool: withAuth('coach', (obj, { days }, { prisma, school }, info) => {
        return getStatsByDay(days, (startDate) =>
          prisma.$transaction([
            prisma.$queryRaw`
              SELECT
                TO_CHAR("SchoolUserRole"."createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "SchoolUserRole"
              LEFT JOIN "UserRole" ON "SchoolUserRole"."userRoleId" = "UserRole"."id"
              WHERE "SchoolUserRole"."schoolId" = ${school.id} AND "UserRole"."status" = 'PENDING' AND "SchoolUserRole"."createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `,
            prisma.schoolUserRole.count({
              where: { schoolId: school.id, userRole: { status: 'PENDING' } },
            }),
          ])
        )
      }),
      statsOfAcceptedMembersInSchool: withAuth('coach', (obj, { days }, { prisma, school }, info) => {
        return getStatsByDay(days, (startDate) =>
          prisma.$transaction([
            prisma.$queryRaw`
              SELECT
                TO_CHAR("SchoolUserRole"."createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "SchoolUserRole"
              LEFT JOIN "UserRole" ON "SchoolUserRole"."userRoleId" = "UserRole"."id"
              WHERE "SchoolUserRole"."schoolId" = ${school.id} AND "UserRole"."status" = 'ACCEPTED' AND "SchoolUserRole"."createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `,
            prisma.schoolUserRole.count({
              where: { schoolId: school.id, userRole: { status: 'ACCEPTED' } },
            }),
          ])
        )
      }),
    },
  },
})
