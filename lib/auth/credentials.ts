import { timingSafeEqual } from "crypto";
import type { Role } from "@prisma/client";

export interface Credential {
  username: string;
  password: string;
  displayName: string;
  role: Role;
}

function safeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Still do a comparison to avoid timing attacks on length
      timingSafeEqual(bufA, bufA);
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export function findCredential(
  username: string,
  password: string
): Credential | null {
  const adminUser = process.env.ADMIN_USERNAME ?? "admin";
  const adminPass = process.env.ADMIN_PASSWORD ?? "admin";
  const adminName = process.env.ADMIN_DISPLAY_NAME ?? "Admin";

  const staffUser = process.env.STAFF_USERNAME ?? "staff";
  const staffPass = process.env.STAFF_PASSWORD ?? "staff";
  const staffName = process.env.STAFF_DISPLAY_NAME ?? "Staff";

  const credentials: Credential[] = [
    { username: adminUser, password: adminPass, displayName: adminName, role: "ADMIN" },
    { username: staffUser, password: staffPass, displayName: staffName, role: "STAFF" },
  ];

  for (const cred of credentials) {
    if (safeEqual(username, cred.username) && safeEqual(password, cred.password)) {
      return cred;
    }
  }

  return null;
}
