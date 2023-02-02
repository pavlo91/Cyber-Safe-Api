import { Prisma, PrismaClient } from '@prisma/client'
import { Storage } from '../libs/storage'

export async function updateImage(
  id: string | undefined | null,
  prisma: PrismaClient
): Promise<Prisma.ImageUpdateOneWithoutUserNestedInput | undefined> {
  if (!id) return

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
