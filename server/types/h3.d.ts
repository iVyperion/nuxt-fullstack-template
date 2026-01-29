import type { PrismaClient } from '@prisma/client'

declare module 'h3' {
  interface H3EventContext {
    prisma: PrismaClient
  }
}
