export interface SocialProvider {
  getAuthorizationURL(userId: string): Promise<string>
  finishAuthorization(data: unknown): Promise<void>
  refreshToken(id: string): Promise<void>
}
