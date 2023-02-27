import { randAlphaNumeric } from '@ngneat/falso'
import { User } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { config } from '../config'

export function hashPassword(password: string | undefined | null) {
  if (typeof password !== 'string') return null
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hashedPassword: string) {
  return bcrypt.compareSync(password, hashedPassword)
}

export function createJWT(user: User) {
  const payload = {
    uuid: user.uuid,
  }

  return jwt.sign(payload, config.secret)
}

export function parseJWT(token: string) {
  const json = jwt.verify(token, config.secret)

  const schema = z.object({
    uuid: z.string(),
  })

  const payload = schema.parse(json)

  return {
    uuid: payload.uuid,
  }
}

export function randomToken(length: number = 16) {
  return randAlphaNumeric({ length }).join('')
}
