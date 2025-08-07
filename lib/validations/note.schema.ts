import { z } from "zod";

export const addNoteSchema = z.object({
  orderId: z.string().min(1),
  body: z.string().min(1, "Note cannot be empty").max(2000),
});

export type AddNoteInput = z.infer<typeof addNoteSchema>;
