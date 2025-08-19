import { NextResponse } from "next/server";
import { findCredential } from "@/lib/auth/credentials";
import { setSessionCookie } from "@/lib/auth/session";
import { upsertUserFromSession } from "@/lib/services/user.service";
import { loginSchema } from "@/lib/validations/auth.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const cred = findCredential(parsed.data.username, parsed.data.password);
    if (!cred) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
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

    return NextResponse.json({
      role: user.role,
      redirectTo: user.role === "ADMIN" ? "/admin" : "/staff",
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
