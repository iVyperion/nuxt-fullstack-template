import crypto from 'node:crypto'
import { promisify } from 'node:util'
import type { H3Event } from 'h3'
import { getRequestHeader } from 'h3'

const SESSION_TOKEN_BYTES = 48

export const SESSION_COOKIE_NAME = 'session_token'
export const DEFAULT_SESSION_TTL = 60 * 60 * 24 * 7 // 7 days
export const LONG_SESSION_TTL = 60 * 60 * 24 * 30 // 30 days

export function createSessionToken(): string {
  return crypto.randomBytes(SESSION_TOKEN_BYTES).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function getClientIp(event: H3Event): string | undefined {
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim()
  }

  return event.node.req.socket.remoteAddress || undefined
}

export function getUserAgent(event: H3Event): string | undefined {
  return getRequestHeader(event, 'user-agent') || undefined
}
