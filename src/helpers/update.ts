import { Prisma, PrismaClient } from '@prisma/client'
import { Storage } from '../libs/storage'
import { AddressUpdate, InputMaybe } from '../types/graphql'

export async function updateImage(
  id: string | undefined | null,
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

  const { url } = await Storage.shared.saveUpload(tempUpload.blobName)

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
