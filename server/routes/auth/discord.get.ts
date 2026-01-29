import { getQuery, sendRedirect, setCookie, getCookie } from 'h3'

const provider = 'discord'

export default defineOAuthDiscordEventHandler({
  config: {
    scope: ['identify', 'email']
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const discordUser = user as DiscordOAuthUser
      const tokenSet = tokens as OAuthTokens

      const discordId = String(discordUser.id || '')
      if (!discordId) {
        throw new Error('Discord user id missing')
      }

      // Check if user is already logged in (linking account)
      const existingSession = getCookie(event, SESSION_COOKIE_NAME)
      let isLinking = false
      let currentUserId: string | null = null

      if (existingSession) {
        const sessionHash = hashToken(existingSession)
        const session = await prisma.session.findUnique({
          where: { tokenHash: sessionHash },
          include: { user: true }
        })

        if (session && session.expiresAt > new Date()) {
          isLinking = true
          currentUserId = session.userId
        }
      }

      const email = (discordUser.email || '').toLowerCase() || `discord-${discordId}@users.discord.invalid`
      let username =
        discordUser.global_name || discordUser.username || discordUser.name || `discord-${discordId}`

      const existingAccount = await prisma.authAccount.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId: discordId } },
        include: { user: true }
      })

      let dbUser = existingAccount?.user

      if (!dbUser) {
        if (isLinking && currentUserId) {
          // User is logged in - link Discord to their existing account
          dbUser = await prisma.user.findUnique({
            where: { id: currentUserId }
          })

          if (!dbUser) {
            throw new Error('Current user not found')
          }
        } else {
          // Not logged in - proceed with normal signup/login flow
          // Check if username is already taken
          const existingUsername = await prisma.user.findUnique({
            where: { username }
          })

          // If username exists, append Discord ID to make it unique
          if (existingUsername) {
            username = `${username}-${discordId.slice(-4)}`
          }

          // Try to find user by email first
          const existingUser = await prisma.user.findUnique({
            where: { email }
          })

          if (existingUser) {
            // User exists with this email, just use it
            dbUser = existingUser
          } else {
            // Create new user
            dbUser = await prisma.user.create({
              data: {
                email,
                username
              }
            })
          }
        }
      }

      // Always upsert the auth account to link it
      await prisma.authAccount.upsert({
        where: { provider_providerAccountId: { provider, providerAccountId: discordId } },
        update: {
          accessToken: tokenSet.access_token || tokenSet.accessToken,
          refreshToken: tokenSet.refresh_token || tokenSet.refreshToken,
          tokenType: tokenSet.token_type || tokenSet.tokenType,
          scope: tokenSet.scope,
          expiresAt: tokenSet.expires_in
            ? new Date(Date.now() + tokenSet.expires_in * 1000)
            : null
        },
        create: {
          provider,
          providerAccountId: discordId,
          userId: dbUser.id,
          accessToken: tokenSet.access_token || tokenSet.accessToken,
          refreshToken: tokenSet.refresh_token || tokenSet.refreshToken,
          tokenType: tokenSet.token_type || tokenSet.tokenType,
          scope: tokenSet.scope,
          expiresAt: tokenSet.expires_in
            ? new Date(Date.now() + tokenSet.expires_in * 1000)
            : null
        }
      })

      // Create database session (same as normal login)
      const sessionToken = createSessionToken()
      const tokenHash = hashToken(sessionToken)
      const expiresAt = new Date(Date.now() + DEFAULT_SESSION_TTL * 1000)

      await prisma.session.create({
        data: {
          userId: dbUser.id,
          tokenHash,
          expiresAt,
          userAgent: getUserAgent(event),
          ipAddress: getClientIp(event)
        }
      })

      setCookie(event, SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: DEFAULT_SESSION_TTL
      })

      const { redirect } = getQuery(event)
      const redirectTo = typeof redirect === 'string' && redirect ? redirect : (isLinking ? '/profile?linked=discord' : '/')
      return sendRedirect(event, redirectTo)
    } catch (error: any) {
      console.error('Discord OAuth error:', error)
      const errorMessage = encodeURIComponent(error.message || 'Discord authentication failed')
      return sendRedirect(event, `/login?error=${errorMessage}`)
    }
  },
  onError(event, error) {
    console.error('Discord OAuth error:', error)
    const errorMessage = encodeURIComponent(error.message || 'Discord authentication failed')
    return sendRedirect(event, `/login?error=${errorMessage}`)
  }
})
