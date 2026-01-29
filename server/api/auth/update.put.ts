import { getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Validate input
  if (!body.username || !body.email) {
    throw createError({
      statusCode: 400,
      message: "Username and email are required",
    });
  }

  // Validate avatarUrl if provided
  if (body.avatarUrl !== undefined && body.avatarUrl !== null && body.avatarUrl !== "") {
    try {
      new URL(body.avatarUrl);
    } catch {
      throw createError({
        statusCode: 400,
        message: "Invalid avatar URL",
      });
    }
  }

  // Get current user from session
  const token = getCookie(event, SESSION_COOKIE_NAME);
  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Not authenticated",
    });
  }

  try {
    // Verify session exists and is valid
    const sessionRecord = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });

    if (!sessionRecord || sessionRecord.expiresAt < new Date()) {
      throw createError({
        statusCode: 401,
        message: "Session expired",
      });
    }

    const userId = sessionRecord.userId;

    // Check if email is already taken by another user
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: body.email,
        id: { not: userId },
      },
    });

    if (existingEmail) {
      throw createError({
        statusCode: 400,
        message: "Email already in use",
      });
    }

    // Check if username is already taken by another user
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: body.username,
        id: { not: userId },
      },
    });

    if (existingUsername) {
      throw createError({
        statusCode: 400,
        message: "Username already taken",
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: body.username,
        email: body.email,
        avatarUrl: body.avatarUrl,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (error: any) {
    console.error("Update profile error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Failed to update profile",
    });
  }
});
