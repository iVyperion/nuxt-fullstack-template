import { setCookie } from 'h3'

interface RegisterBody {
  email?: string
  username?: string
  password?: string
  rememberMe?: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event)

  const email = body?.email?.trim().toLowerCase()
  const username = body?.username?.trim()
  const password = body?.password?.trim()
  const rememberMe = Boolean(body?.rememberMe)

  if (!email || !username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email, username and password are required' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters long' })
  }

  // Check for existing email
  const existingEmail = await prisma.user.findUnique({
    where: { email }
  })

  if (existingEmail) {
    throw createError({ statusCode: 409, statusMessage: 'A user with that email already exists' })
  }

  // Check for existing username
  let finalUsername = username
  const existingUsername = await prisma.user.findUnique({
    where: { username }
  })

  if (existingUsername) {
    throw createError({ statusCode: 409, statusMessage: 'That username is already taken' })
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      username: finalUsername,
      passwordHash
    }
  })

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
