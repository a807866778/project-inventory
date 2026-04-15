"use server";

import { db, schema } from "@/lib/db";
import { eq } from "@/lib/db/queries";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7天

export async function login(username: string, password: string) {
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();

  if (!user) {
    return { success: false, error: "用户名或密码错误" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "用户名或密码错误" };
  }

  // 创建会话
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(schema.sessions).values({
    id: sessionId,
    userId: user.id,
    expiresAt,
  });

  revalidatePath("/");
  
  // 返回 sessionId，让客户端设置 cookie
  return { 
    success: true, 
    sessionId,
    maxAge: SESSION_DURATION / 1000 
  };
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  
  if (sessionId) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
    cookieStore.delete("session_id");
  }
  
  revalidatePath("/");
  redirect("/login");
}
