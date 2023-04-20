import { prisma } from '../prisma'
import { builder } from './builder'

type StatsByDay = {
  stats: { day: string; value: number }[]
  total: number
}

const StatByDay = builder.objectRef<StatsByDay['stats'][0]>('StatByDay')
const StatsByDay = builder.objectRef<StatsByDay>('StatsByDay')

StatByDay.implement({
  fields: (t) => ({
    day: t.exposeString('day'),
    value: t.exposeInt('value'),
  }),
})

StatsByDay.implement({
  fields: (t) => ({
    stats: t.expose('stats', { type: [StatByDay] }),
    total: t.exposeInt('total'),
  }),
})

async function getStatsByDay(
  days: number,
  findManyAndCount: (startDate: Date) => Promise<[StatsByDay['stats'], number]>
) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setUTCHours(0, 0, 0, 0)

  const [data, total] = await findManyAndCount(date)
  const stats: StatsByDay['stats'] = []

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

builder.queryFields((t) => ({
  statsOfCreatedUsers: t.field({
    type: StatsByDay,
    args: {
      days: t.arg.int({ defaultValue: 15 }),
    },
    resolve: (obj, { days }) => {
      return getStatsByDay(days, (startDate) =>
        prisma.$transaction([
          prisma.$queryRaw`
              SELECT
                TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "User"
              WHERE "createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `,
          prisma.user.count(),
        ])
      )
    },
  }),
  statsOfCreatedSchools: t.field({
    type: StatsByDay,
    args: {
      days: t.arg.int({ defaultValue: 15 }),
    },
    resolve: (obj, { days }) => {
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
    },
  }),
  statsOfCreatedMembers: t.field({
    type: StatsByDay,
    args: {
      days: t.arg.int({ defaultValue: 15 }),
    },
    resolve: (obj, { days }) => {
      return getStatsByDay(days, (startDate) =>
        prisma.$transaction([
          prisma.$queryRaw`
          SELECT
            TO_CHAR("SchoolRole"."createdAt", 'YYYY-MM-DD') AS day,
            CAST(COUNT(*) AS INTEGER) AS value
          FROM "SchoolRole"
          LEFT JOIN "UserRole" ON "SchoolRole"."userRoleId" = "UserRole"."id"
          WHERE "UserRole"."status" = 'ACCEPTED' AND "SchoolRole"."createdAt" >= ${startDate}
          GROUP BY day
          ORDER BY day DESC
        `,
          prisma.schoolRole.count({
            where: { userRole: { status: 'ACCEPTED' } },
          }),
        ])
      )
    },
  }),
  statsOfCreatedParents: t.field({
    type: StatsByDay,
    args: {
      days: t.arg.int({ defaultValue: 15 }),
    },
    resolve: (obj, { days }) => {
      return getStatsByDay(days, (startDate) =>
        prisma.$transaction([
          prisma.$queryRaw`
          SELECT
            TO_CHAR("ParentRole"."createdAt", 'YYYY-MM-DD') AS day,
            CAST(COUNT(*) AS INTEGER) AS value
          FROM "ParentRole"
          LEFT JOIN "UserRole" ON "ParentRole"."userRoleId" = "UserRole"."id"
          WHERE "UserRole"."status" = 'ACCEPTED' AND "ParentRole"."createdAt" >= ${startDate}
          GROUP BY day
          ORDER BY day DESC
        `,
          prisma.parentRole.count({
            where: { userRole: { status: 'ACCEPTED' } },
          }),
        ])
      )
    },
  }),
  statsOfCreatedMembersInSchool: t.field({
    type: StatsByDay,
    args: {
      schoolId: t.arg.id(),
      days: t.arg.int({ defaultValue: 15 }),
    },
    resolve: (obj, { schoolId, days }) => {
      return getStatsByDay(days, (startDate) =>
        prisma.$transaction([
          prisma.$queryRaw`
          SELECT
            TO_CHAR("createdAt", 'YYYY-MM-DD') AS day,
            CAST(COUNT(*) AS INTEGER) AS value
          FROM "SchoolRole"
          WHERE "schoolId" = ${schoolId} AND "createdAt" >= ${startDate}
          GROUP BY day
          ORDER BY day DESC
        `,
          prisma.schoolRole.count({ where: { schoolId } }),
        ])
      )
    },
  }),
  statsOfInvitedMembersInSchool: t.field({
    type: StatsByDay,
    args: {
      schoolId: t.arg.id(),
      days: t.arg.int({ defaultValue: 15 }),
    },
    resolve: (obj, { schoolId, days }) => {
      return getStatsByDay(days, (startDate) =>
        prisma.$transaction([
          prisma.$queryRaw`
          SELECT
            TO_CHAR("SchoolRole"."createdAt", 'YYYY-MM-DD') AS day,
            CAST(COUNT(*) AS INTEGER) AS value
          FROM "SchoolRole"
          LEFT JOIN "UserRole" ON "SchoolRole"."userRoleId" = "UserRole"."id"
          WHERE "SchoolRole"."schoolId" = ${schoolId} AND "UserRole"."status" = 'PENDING' AND "SchoolRole"."createdAt" >= ${startDate}
          GROUP BY day
          ORDER BY day DESC
        `,
          prisma.schoolRole.count({
            where: { schoolId, userRole: { status: 'PENDING' } },
          }),
        ])
      )
    },
  }),
  statsOfAcceptedMembersInSchool: t.field({
    type: StatsByDay,
    args: {
      schoolId: t.arg.id(),
      days: t.arg.int({ defaultValue: 15 }),
    },
    resolve: (obj, { schoolId, days }) => {
      return getStatsByDay(days, (startDate) =>
        prisma.$transaction([
          prisma.$queryRaw`
              SELECT
                TO_CHAR("SchoolRole"."createdAt", 'YYYY-MM-DD') AS day,
                CAST(COUNT(*) AS INTEGER) AS value
              FROM "SchoolRole"
              LEFT JOIN "UserRole" ON "SchoolRole"."userRoleId" = "UserRole"."id"
              WHERE "SchoolRole"."schoolId" = ${schoolId} AND "UserRole"."status" = 'ACCEPTED' AND "SchoolRole"."createdAt" >= ${startDate}
              GROUP BY day
              ORDER BY day DESC
            `,
          prisma.schoolRole.count({
            where: { schoolId, userRole: { status: 'ACCEPTED' } },
          }),
        ])
      )
    },
  }),
}))
