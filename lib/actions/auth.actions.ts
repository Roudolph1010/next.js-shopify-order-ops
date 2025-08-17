"use server";

import { redirect } from "next/navigation";
import { findCredential } from "@/lib/auth/credentials";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { upsertUserFromSession } from "@/lib/services/user.service";
import { loginSchema } from "@/lib/validations/auth.schema";

export async function loginAction(formData: FormData) {
  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const cred = findCredential(parsed.data.username, parsed.data.password);
  if (!cred) {
    return { error: "Invalid username or password" };
  }

  const user = await upsertUserFromSession({
    username: cred.username,
    displayName: cred.displayName,
    role: cred.role,
  });

  await setSessionCookie({
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  });

  redirect(cred.role === "ADMIN" ? "/admin" : "/staff");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
