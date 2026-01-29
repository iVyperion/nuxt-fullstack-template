import { setCookie } from 'h3'

interface LoginBody {
  email?: string
  password?: string
  rememberMe?: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password?.trim()
  const rememberMe = Boolean(body?.rememberMe)

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.passwordHash) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const isValid = await verifyPassword(password, user.passwordHash)

  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  const sessionMaxAge = rememberMe ? LONG_SESSION_TTL : DEFAULT_SESSION_TTL
  const token = createSessionToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + sessionMaxAge * 1000)

  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: getUserAgent(event),
      ipAddress: getClientIp(event)
    }
  })

  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: sessionMaxAge
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    }
  }
})
