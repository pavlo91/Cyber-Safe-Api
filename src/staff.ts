import { randPassword } from '@ngneat/falso'
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

  const name = await ask('Name: ', true)
  const email = await ask('Email: ', true)
  const password = (await ask('Password (leave blank for random): ')) || randPassword()

  await prisma.user.create({
    data: {
      name,
      email,
      password,
      isStaff: true,
      isConfirmed: true,
    },
  })

  console.log({ name, email, password })
}

main().finally(() => {
  rl.close()
})
