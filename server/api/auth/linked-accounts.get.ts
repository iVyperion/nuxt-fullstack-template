import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE_NAME);

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Not authenticated" });
  }

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          accounts: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    throw createError({ statusCode: 401, statusMessage: "Session expired" });
  }

  return session.user.accounts.map((account) => ({
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    createdAt: account.createdAt,
  }));
});
