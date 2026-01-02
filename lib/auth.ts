import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import type { User } from "@prisma/client";

const USER_SESSION_COOKIE_NAME = "user_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

// Simple session token generation
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password against hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export type SafeUser = Omit<User, "passwordHash">;

// Create a user session and set cookie
export async function createUserSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);

  await prisma.session.create({
    data: {
      token,
      expiresAt,
      userId,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  return token;
}

// Get user from session cookie
export async function getUserFromSession(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(USER_SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionCookie.value },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired or invalid - clean up
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  // Return user without passwordHash
  const { passwordHash: _, ...safeUser } = session.user;
  return safeUser;
}

// Check if user is authenticated
export async function isUserAuthenticated(): Promise<boolean> {
  const user = await getUserFromSession();
  return !!user;
}

// Check if current user is an admin
export async function isUserAdmin(): Promise<boolean> {
  const user = await getUserFromSession();
  return user?.role === "admin";
}

// Get current user if they are an admin, otherwise null
export async function getAdminUser(): Promise<SafeUser | null> {
  const user = await getUserFromSession();
  if (user?.role === "admin") {
    return user;
  }
  return null;
}

// Clear user session
export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(USER_SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    await prisma.session.deleteMany({
      where: { token: sessionCookie.value },
    });
  }

  cookieStore.delete(USER_SESSION_COOKIE_NAME);
}

// Validate user credentials
export async function validateUserCredentials(
  email: string,
  password: string
): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// Create a new user
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<SafeUser> {
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
    },
  });

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// Check if email is already registered
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return !!user;
}
