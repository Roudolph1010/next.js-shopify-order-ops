import { db } from "@/lib/db/client";
import type { Role } from "@prisma/client";

export async function upsertUserFromSession(params: {
  username: string;
  displayName: string;
  role: Role;
}) {
  return db.user.upsert({
    where: { username: params.username },
    update: {
      displayName: params.displayName,
      role: params.role,
    },
    create: {
      username: params.username,
      displayName: params.displayName,
      role: params.role,
    },
  });
}

export async function getUserByUsername(username: string) {
  return db.user.findUnique({ where: { username } });
}

export async function getAllStaffUsers() {
  return db.user.findMany({
    where: { role: "STAFF", active: true },
    orderBy: { displayName: "asc" },
  });
}

export async function getStaffWorkload() {
  return db.user.findMany({
    where: { role: "STAFF", active: true },
    include: {
      assignments: {
        where: { unassignedAt: null },
        include: {
          order: {
            select: {
              id: true,
              externalOrderNumber: true,
              internalStatus: true,
              priority: true,
            },
          },
        },
      },
    },
    orderBy: { displayName: "asc" },
  });
}
