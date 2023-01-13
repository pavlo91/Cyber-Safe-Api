import { Prisma, PrismaClient } from '@prisma/client'
import readline from 'readline'
import { MiddlewareManager } from './middlewares'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question: string, required = false) {
  return new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      if (required && !answer) {
        ask(question, required).then(resolve)
      } else {
        resolve(answer)
      }
    })
  })
}

async function main() {
  const prisma = new PrismaClient()

  const middleware = new MiddlewareManager(prisma)
  middleware.applyMiddlewares()

  const email = await ask('E-mail: ', true)
  const password = await ask('Password (leave empty to send invitation e-mail): ')

  const data: Prisma.UserCreateInput = {
    email,
    name: '',
    roles: {
      create: {
        role: 'STAFF',
      },
    },
  }

  if (!!password) {
    data.emailConfirmed = true
    data.password = password
  }

  await prisma.user.create({ data })
}

main().finally(() => {
  rl.close()
})
