"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  assignOrder,
  unassignOrder,
} from "@/lib/services/assignment.service";
import {
  assignOrderSchema,
  unassignOrderSchema,
} from "@/lib/validations/assignment.schema";

export async function assignOrderAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = assignOrderSchema.safeParse({
    orderId: formData.get("orderId"),
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  try {
    await assignOrder({
      orderId: parsed.data.orderId,
      userId: parsed.data.userId,
      assignedByUserId: session.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/staff");
    revalidatePath(`/orders/${parsed.data.orderId}`);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Assignment failed",
    };
  }
}

export async function unassignOrderAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = unassignOrderSchema.safeParse({
    orderId: formData.get("orderId"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  try {
    await unassignOrder({
      orderId: parsed.data.orderId,
      actorUserId: session.userId,
    });

    revalidatePath("/admin");
    revalidatePath("/staff");
    revalidatePath(`/orders/${parsed.data.orderId}`);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unassign failed",
    };
  }
}
