"use server";

import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createUser(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || !user.permissions.includes("user:manage")) {
    return { error: "没有权限" };
  }

  const username = formData.get("username") as string;
  const realName = formData.get("realName") as string;
  const password = formData.get("password") as string;

  if (!username || !realName || !password) {
    return { error: "请填写所有必填字段" };
  }

  if (password.length < 6) {
    return { error: "密码长度至少6位" };
  }

  // 检查用户名是否已存在
  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.username, username),
  });

  if (existing) {
    return { error: "用户名已存在" };
  }

  const now = new Date();
  const userId = uuidv4();

  // 创建用户
  await db.insert(schema.users).values({
    id: userId,
    username,
    passwordHash: await hashPassword(password),
    realName,
    createdAt: now,
  });

  revalidatePath("/settings/users");
  return { success: true };
}
