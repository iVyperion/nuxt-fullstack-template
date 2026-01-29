import { deleteCookie, getCookie, setCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE_NAME)

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const tokenHash = hashToken(token)
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true }
  })

  if (!session || session.expiresAt < new Date()) {
    deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
    throw createError({ statusCode: 401, statusMessage: 'Session expired' })
  }

  // Refresh the session cookie to extend client-side validity while keeping DB expiry unchanged
  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DEFAULT_SESSION_TTL
  })

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      role: session.user.role,
      avatarUrl: session.user.avatarUrl,
      createdAt: session.user.createdAt
    }
  }
})
