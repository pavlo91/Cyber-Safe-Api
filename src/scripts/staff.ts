import readline from 'readline'
import { z, ZodError } from 'zod'
import '../middleware'
import { prisma } from '../prisma'

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

main().catch((error) => {
  if (error instanceof ZodError) {
    error.issues.forEach((issue) => {
      console.error(`${issue.path.join('.')}: ${issue.message}`)
    })
  } else {
    console.error(error)
  }
})
