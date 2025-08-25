"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateOrderStatusAction } from "@/lib/actions/order.actions";
import type { InternalStatus } from "@prisma/client";

const STATUS_OPTIONS: { value: InternalStatus; label: string }[] = [
  { value: "UNASSIGNED", label: "Unassigned" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "PACKED", label: "Packed" },
  { value: "COMPLETED", label: "Completed" },
];

interface UpdateStatusFormProps {
  orderId: string;
  currentStatus: InternalStatus;
}

export function UpdateStatusForm({ orderId, currentStatus }: UpdateStatusFormProps) {
  const [selected, setSelected] = useState<InternalStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (selected === currentStatus) return;
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("status", selected);

      const result = await updateOrderStatusAction(formData);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error ?? "Update failed");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Work status</Label>
        <Select
          value={selected}
          onValueChange={(v) => {
            if (v) {
              setSelected(v as InternalStatus);
              setSuccess(false);
            }
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || selected === currentStatus}
        >
          {isPending ? "Saving…" : "Update status"}
        </Button>

        {success && (
          <span className="text-sm text-green-600">Status updated</span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
