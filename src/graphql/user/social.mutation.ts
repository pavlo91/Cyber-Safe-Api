import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'

export default createGraphQLModule({
  typeDefs: `#graphql
    enum SocialType {
      FACEBOOK
    }

    extend type Mutation {
      linkFacebook: ID
      unlinkSocial(social: SocialType): ID
    }
  `,
  resolvers: {
    Mutation: {
      linkFacebook: withAuth('any', async (obj, args, { prisma, user }, info) => {
        await prisma.sFacebook.create({
          data: {
            userId: user.id,
            token: '',
          },
        })
      }),
      unlinkSocial: withAuth('any', async (obj, { social }, { prisma, user }, info) => {
        switch (social) {
          case 'FACEBOOK':
            await prisma.sFacebook.delete({
              where: { userId: user.id },
            })

            break

          default:
            break
        }
      }),
    },
  },
})
