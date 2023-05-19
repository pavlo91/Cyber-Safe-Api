import { User } from '@prisma/client'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import config from '../config'

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

/**
 *
 * @param {number} [length=8]
 * @returns string
 */
export function randomToken(length: number = 8) {
  return crypto.randomBytes(32).toString('base64url').replace(/[-_]/g, '').substring(0, length)
}
