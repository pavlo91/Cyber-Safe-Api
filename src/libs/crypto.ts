import { User } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { Config } from '../config'

export function hashPassword(password: string | undefined | null) {
  if (typeof password !== 'string') return null
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compareSync(password, hashedPassword)
}

export function createJwt(user: User) {
  const data = {
    uuid: user.uuid,
  }

  return jwt.sign(data, Config.secret)
}

export function parseJwt(token: string) {
  const json = jwt.verify(token, Config.secret)

  const schema = z.object({
    uuid: z.string(),
  })

  const data = schema.parse(json)

  return {
    uuid: data.uuid,
  }
}
