import { createGraphQLModule } from '..'
import { withAuth, withAuthMembership } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: `#graphql
    type Mutation {
      inviteParent(email: String!, childId: ID!, relation: String): ID
      removeParent(id: ID!, childId: ID!): ID
      updateRelationship(childId: ID!, input: RelationshipUpdate!): ID
    }
  `,
  resolvers: {
    Mutation: {
      inviteParent: withAuthMembership(
        'admin',
        async (obj, { email, childId, relation }, { prisma, organization }, info) => {
          const child = await prisma.user.findFirstOrThrow({
            where: {
              id: childId,
              memberships: { some: { organizationId: organization.id } },
            },
          })

          await prisma.user.upsert({
            where: { email },
            update: {
              children: {
                create: {
                  childUserId: child.id,
                  relation,
                },
              },
            },
            create: {
              email,
              name: '',
              children: {
                create: {
                  childUserId: child.id,
                  relation,
                },
              },
            },
          })
        }
      ),
      removeParent: withAuthMembership('admin', async (obj, { id, childId }, { prisma, organization }, info) => {
        await prisma.relationship.deleteMany({
          where: {
            parentUserId: id,
            childUser: {
              id: childId,
              memberships: { some: { organizationId: organization.id } },
            },
          },
        })
      }),
      updateRelationship: withAuth('parent', async (obj, { childId, input }, { prisma, user }, info) => {
        await prisma.relationship.update({
          where: {
            parentUserId_childUserId: {
              parentUserId: user.id,
              childUserId: childId,
            },
          },
          data: { ...input },
        })
      }),
    },
  },
})
