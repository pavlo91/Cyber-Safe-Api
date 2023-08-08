import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { checkAuth, isUser } from '../utils/auth'

pothos.mutationFields((t) => ({
  createDevice: t.boolean({
    args: {
      token: t.arg.string(),
    },
    resolve: async (obj, { token }, { user }) => {
      await checkAuth(() => isUser(user))

      await prisma.device.upsert({
        update: {},
        create: { token, userId: user!.id },
        where: { token_userId: { token, userId: user!.id } },
      })

      return true
    },
  }),
}))
