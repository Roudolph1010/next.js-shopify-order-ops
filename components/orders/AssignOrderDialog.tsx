"use client";

import { useState, useTransition } from "react";
import { UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignOrderAction, unassignOrderAction } from "@/lib/actions/assignment.actions";

interface StaffUser {
  id: string;
  displayName: string;
  username: string;
}

interface AssignOrderDialogProps {
  orderId: string;
  orderNumber: string;
  staffList: StaffUser[];
  currentAssignee?: StaffUser | null;
}

export function AssignOrderDialog({
  orderId,
  orderNumber,
  staffList,
  currentAssignee,
}: AssignOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAssign() {
    if (!selectedUserId) return;
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderId", orderId);
      formData.set("userId", selectedUserId);

      const result = await assignOrderAction(formData);

      if (result.success) {
        setOpen(false);
        setSelectedUserId("");
      } else {
        setError(result.error ?? "Failed to assign");
      }
    });
  }

  function handleUnassign() {
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("orderId", orderId);

      const result = await unassignOrderAction(formData);

      if (result.success) {
        setOpen(false);
      } else {
        setError(result.error ?? "Failed to unassign");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          {currentAssignee ? "Reassign" : "Assign"}
        </Button>
      } />
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign {orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {currentAssignee && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-xs text-muted-foreground">Currently assigned to</p>
                <p className="text-sm font-medium">{currentAssignee.displayName}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnassign}
                disabled={isPending}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Assign to</Label>
            <Select
              value={selectedUserId}
              onValueChange={(v) => setSelectedUserId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select staff member…" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedUserId || isPending}
            >
              {isPending ? "Saving…" : currentAssignee ? "Reassign" : "Assign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
