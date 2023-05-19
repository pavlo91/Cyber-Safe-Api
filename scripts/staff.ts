import readline from 'readline'
import { z } from 'zod'
import '../libs/middleware'
import prisma from '../libs/prisma'

function ask(question: string) {
  return new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.question(question, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}

const schema = z.object({
  name: z.string().min(4),
  email: z.string().email(),
  password: z.union([z.string().min(4), z.literal('')]).transform((value) => value || undefined),
})

async function main() {
  const name = await ask('Name: ')
  const email = await ask('E-mail: ')
  const password = await ask('Password: ')

  const data = schema.parse({ name, email, password })

  await prisma.user.create({
    data: {
      ...data,
      roles: {
        create: {
          type: 'STAFF',
          status: 'ACCEPTED',
        },
      },
    },
  })
}

main()
