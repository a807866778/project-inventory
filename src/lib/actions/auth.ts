"use server";

import { login as authLogin, logout as authLogout } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(username: string, password: string) {
  const result = await authLogin(username, password);
  if (result.success) {
    revalidatePath("/");
    return { success: true };
  }
  return result;
}

export async function logout() {
  await authLogout();
  revalidatePath("/");
  redirect("/login");
}
