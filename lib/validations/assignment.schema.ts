import { z } from "zod";

export const assignOrderSchema = z.object({
  orderId: z.string().min(1),
  userId: z.string().min(1),
});

export const unassignOrderSchema = z.object({
  orderId: z.string().min(1),
});

export type AssignOrderInput = z.infer<typeof assignOrderSchema>;
export type UnassignOrderInput = z.infer<typeof unassignOrderSchema>;
