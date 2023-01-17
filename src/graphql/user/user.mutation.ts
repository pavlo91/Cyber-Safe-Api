import { randAlphaNumeric } from '@ngneat/falso'
import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { Config } from '../../config'
import { withAuth } from '../../helpers/auth'
import { Postmark } from '../../libs/postmark'

export default createGraphQLModule({
  typeDefs: gql`
    extend type Mutation {
      inviteStaff(email: String!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteStaff: withAuth('staff', async (obj, { email }, { prisma }, info) => {
        const user = await prisma.user.upsert({
          include: { roles: true },
          where: { email },
          update: {},
          create: {
            email,
            name: '',
          },
        })

        const statusToken = randAlphaNumeric({ length: 16 }).join('')
        const staffRole = user.roles.find((e) => e.role === 'STAFF')

        if (!staffRole) {
          await prisma.userRole.create({
            data: {
              statusToken,
              role: 'STAFF',
              userId: user.id,
            },
          })
        } else {
          await prisma.userRole.update({
            where: { id: staffRole.id },
            data: {
              statusToken,
              status: 'PENDING',
            },
          })
        }

        const acceptUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/accept', { statusToken })
        const declineUrl = Config.composeUrl('apiUrl', '/api/respond/:statusToken/decline', { statusToken })
        Postmark.shared.send(email, 'email/invite-staff.pug', { acceptUrl, declineUrl })
      }),
    },
  },
})
