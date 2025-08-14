import { db } from "@/lib/db/client";
import { logActivity } from "@/lib/services/activity.service";

export async function addNote(params: {
  orderId: string;
  userId: string;
  body: string;
}) {
  const { orderId, userId, body } = params;

  await db.$transaction(async (tx) => {
    await tx.note.create({
      data: { orderId, userId, body },
    });

    await logActivity(
      {
        orderId,
        userId,
        action: "NOTE_ADDED",
        metadata: { preview: body.slice(0, 100) },
      },
      tx
    );
  });
}

export async function deleteNote(params: {
  noteId: string;
  userId: string;
  orderId: string;
}) {
  const { noteId, userId, orderId } = params;

  await db.$transaction(async (tx) => {
    await tx.note.delete({ where: { id: noteId } });

    await logActivity(
      {
        orderId,
        userId,
        action: "NOTE_DELETED",
        metadata: { noteId },
      },
      tx
    );
  });
}

export async function getNotesForOrder(orderId: string) {
  return db.note.findMany({
    where: { orderId },
    include: {
      user: { select: { displayName: true, username: true, role: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
