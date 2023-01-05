import { PrismaClient } from '@prisma/client'
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

  const email = await ask('Email: ', true)

  await prisma.user.create({
    data: {
      email,
      name: '',
      isStaff: true,
    },
  })
}

main().finally(() => {
  rl.close()
})
