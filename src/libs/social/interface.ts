import Prisma from '@prisma/client'

export type FetchAndSaveResult = Prisma.Prisma.PostGetPayload<{ include: { media: true } }>

export interface SocialProvider {
  getAuthorizationURL(userId: string): Promise<string>
  finishAuthorization(payload: unknown): Promise<void>
  refreshToken(socialId: string): Promise<void>
  savePost(socialId: string, payload: unknown): Promise<void>
  fetchAndSavePosts(socialId: string): Promise<FetchAndSaveResult[]>
  deletePost(externalId: string): Promise<void>
}
