import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db, schema } from "@/lib/db";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "project-inventory-secret-key-change-in-production"
);

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7天

export interface SessionUser {
  id: string;
  username: string;
  realName: string;
  permissions: string[];
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(schema.sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionUser | null> {
  try {
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(schema.sessions.id, sessionId),
        gt(schema.sessions.expiresAt, new Date())
      ),
    });

    if (!session) return null;

    // 获取用户信息
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, session.userId),
    });

    if (!user) return null;

    // 获取用户角色和权限
    const userRoleRecords = await db.query.userRoles.findMany({
      where: eq(schema.userRoles.userId, user.id),
    });

    const permissions: string[] = [];
    for (const ur of userRoleRecords) {
      const role = await db.query.roles.findFirst({
        where: eq(schema.roles.id, ur.roleId),
      });
      if (role) {
        const rolePerms = JSON.parse(role.permissions) as string[];
        permissions.push(...rolePerms);
      }
    }

    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      permissions: Array.from(new Set(permissions)), // 去重
    };
  } catch {
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (!sessionId) return null;
  return getSession(sessionId);
}

export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.username, username),
  });

  if (!user) {
    return { success: false, error: "用户名或密码错误" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "用户名或密码错误" };
  }

  const sessionId = await createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  if (sessionId) {
    await deleteSession(sessionId);
    cookieStore.delete("session_id");
  }
}

export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  return userPermissions.includes(requiredPermission);
}
