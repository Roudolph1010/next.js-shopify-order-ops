"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addNoteAction } from "@/lib/actions/note.actions";

export function AddNoteForm({ orderId }: { orderId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("body", body);

      const result = await addNoteAction(formData);

      if (result.success) {
        setBody("");
      } else {
        setError(result.error ?? "Failed to add note");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder="Add an internal note…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="resize-none text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        size="sm"
        disabled={isPending || !body.trim()}
      >
        {isPending ? "Adding…" : "Add note"}
      </Button>
    </form>
  );
}
