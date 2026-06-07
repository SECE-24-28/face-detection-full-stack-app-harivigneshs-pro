import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "auth_token";

export type AuthUser = {
  id: string;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function signAuthToken(user: AuthUser) {
  return jwt.sign(user, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token?: string): AuthUser | null {
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (
      typeof payload === "object" &&
      typeof payload.id === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        id: payload.id,
        email: payload.email,
      };
    }

    return null;
  } catch {
    return null;
  }
}
