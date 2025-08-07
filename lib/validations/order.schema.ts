import { z } from "zod";
import { InternalStatus, Priority } from "@prisma/client";

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(InternalStatus),
});

export const updateOrderPrioritySchema = z.object({
  orderId: z.string().min(1),
  priority: z.nativeEnum(Priority),
});

export const updateOrderNotesSchema = z.object({
  orderId: z.string().min(1),
  fulfillmentNotes: z.string().max(2000).optional(),
  deliveryNotes: z.string().max(2000).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderPriorityInput = z.infer<typeof updateOrderPrioritySchema>;
export type UpdateOrderNotesInput = z.infer<typeof updateOrderNotesSchema>;
