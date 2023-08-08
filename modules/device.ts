import pothos from '../libs/pothos'
import prisma from '../libs/prisma'
import { checkAuth, isUser } from '../utils/auth'

pothos.mutationFields((t) => ({
  createDevice: t.boolean({
    args: {
      token: t.arg.string(),
    },
    resolve: async (obj, { token }, { user, req }) => {
      await checkAuth(() => isUser(user))

      let platform = req.headers['x-platform']

      if (typeof platform !== 'string') {
        platform = undefined
      }

      await prisma.device.upsert({
        update: { platform },
        create: { token, userId: user!.id, platform },
        where: { token_userId: { token, userId: user!.id } },
      })

      return true
    },
  }),
}))
