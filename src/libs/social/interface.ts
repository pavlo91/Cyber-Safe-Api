export interface SocialProvider {
  getAuthorizationURL(userId: string): Promise<string>
  finishAuthorization(data: unknown): Promise<void>
  refreshToken(userId: string): Promise<void>
}
