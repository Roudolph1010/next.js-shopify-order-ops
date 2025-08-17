"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { addNote, deleteNote } from "@/lib/services/note.service";
import { addNoteSchema } from "@/lib/validations/note.schema";

export async function addNoteAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = addNoteSchema.safeParse({
    orderId: formData.get("orderId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await addNote({
      orderId: parsed.data.orderId,
      userId: session.userId,
      body: parsed.data.body,
    });

    revalidatePath(`/orders/${parsed.data.orderId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add note",
    };
  }
}

export async function deleteNoteAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const noteId = formData.get("noteId") as string;
  const orderId = formData.get("orderId") as string;

  if (!noteId || !orderId) {
    return { success: false, error: "Missing noteId or orderId" };
  }

  try {
    await deleteNote({ noteId, userId: session.userId, orderId });
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete note",
    };
  }
}
