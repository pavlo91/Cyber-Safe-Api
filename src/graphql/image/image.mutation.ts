import gql from 'graphql-tag'
import { createGraphQLModule } from '..'
import { withAuth } from '../../helpers/auth'
import { Storage } from '../../libs/storage'
import { randomToken } from '../../utils/crypto'

export default createGraphQLModule({
  typeDefs: gql`
    type UploadHeader {
      key: String!
      value: String!
    }

    type Upload {
      id: ID!
      url: String!
      method: String!
      headers: [UploadHeader!]!
    }

    extend type Mutation {
      prepareForUpload: Upload!
    }
  `,
  resolvers: {
    Mutation: {
      prepareForUpload: withAuth('any', async (obj, args, { prisma, user }, info) => {
        const tempImage = await prisma.tempUpload.create({
          data: {
            userId: user.id,
            blobName: randomToken(),
          },
        })

        const upload = await Storage.shared.prepareForUpload(tempImage.blobName)

        return {
          ...upload,
          id: tempImage.id,
        }
      }),
    },
  },
})
