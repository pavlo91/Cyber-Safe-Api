import { Prisma } from '@prisma/client'
import { createGraphQLModule } from '..'
import { select } from '../../helpers/parse'
import { comparePassword, createJwt } from '../../utils/crypto'

export default createGraphQLModule({
  typeDefs: `#graphql
    type JWT {
      token: String
      user: User!
    }

    input RegisterInput {
      name: String!
      organization: OrganizationCreate!
    }

    input ActivateInput {
      name: String!
    }

    type Mutation {
      login(email: String!, password: String!): JWT!
      register(email: String!, password: String!, input: RegisterInput!): ID
      activate(token: String!, password: String!, input: ActivateInput!): ID
    }
  `,
  resolvers: {
    Mutation: {
      async login(obj, { email, password }, { prisma }, info) {
        const args: Prisma.UserFindUniqueOrThrowArgs = {
          ...select(info, 'User', 'user'),
          where: { email },
        }

        if (!args.select) args.select = {}
        args.select.password = true

        const user = await prisma.user.findUniqueOrThrow(args)

        if (!user.password || !comparePassword(password, user.password)) {
          throw new Error("Passwords don't match")
        }

        const token = createJwt(user)

        return { token, user }
      },
      async register(obj, { email, password, input: { name, organization } }, { prisma }, info) {
        await prisma.user.create({
          data: {
            email,
            password,
            name,
            memberships: {
              create: {
                isAdmin: true,
                organization: {
                  create: {
                    name: organization.name,
                    address: {
                      create: {
                        street: organization.address.street,
                        city: organization.address.city,
                        state: organization.address.state,
                        zip: organization.address.zip,
                      },
                    },
                  },
                },
              },
            },
          },
        })
      },
      async activate(obj, { token, password, input: { name } }, { prisma }, info) {
        await prisma.user.update({
          where: { activationToken: token },
          data: {
            name,
            password,
            activationToken: null,
          },
        })
      },
    },
  },
})
