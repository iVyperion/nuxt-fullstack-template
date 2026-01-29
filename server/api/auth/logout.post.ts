import { deleteCookie, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE_NAME)

  if (token) {
    const tokenHash = hashToken(token)
    await prisma.session.deleteMany({ where: { tokenHash } })
    deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
  }

  return { success: true }
})
