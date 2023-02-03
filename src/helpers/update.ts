import { Prisma, PrismaClient } from '@prisma/client'
import { Storage } from '../libs/storage'
import { AddressUpdate, InputMaybe } from '../types/graphql'

export async function updateImage(
  id: string | undefined | null,
  blob: { user: string } | { school: string },
  prisma: PrismaClient
): Promise<Prisma.ImageUpdateOneWithoutUserNestedInput | undefined> {
  if (id === null) {
    return { delete: true }
  }

  if (!id) {
    return undefined
  }

  const tempUpload = await prisma.tempUpload.findFirstOrThrow({
    where: { id },
  })

  let dir: string
  let dirId: string

  if ('user' in blob) {
    dir = 'users'
    dirId = blob.user
  } else if ('school' in blob) {
    dir = 'schools'
    dirId = blob.school
  } else {
    throw new Error('You must provide blob information')
  }

  const { url } = await Storage.shared.saveUpload(tempUpload.blobName, Storage.getBlobName(dir, dirId))

  await prisma.tempUpload.delete({
    where: { id },
  })

  return {
    upsert: {
      create: { url },
      update: { url },
    },
  }
}

export function updateAddress(
  address?: InputMaybe<AddressUpdate>
): Prisma.AddressUpdateOneWithoutSchoolNestedInput | undefined {
  if (address === null) {
    return { delete: true }
  }

  if (!address) {
    return undefined
  }

  return {
    upsert: {
      create: address,
      update: address,
    },
  }
}
