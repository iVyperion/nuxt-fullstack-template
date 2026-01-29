export interface OAuthTokens {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
  accessToken?: string
  refreshToken?: string
  tokenType?: string
}

export interface DiscordOAuthUser {
  id?: string | number
  email?: string
  username?: string
  global_name?: string
  name?: string
}

export interface GoogleOAuthUser {
  sub?: string
  email?: string
  name?: string
  given_name?: string
  family_name?: string
}
