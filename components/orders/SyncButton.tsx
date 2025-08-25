"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncOrdersAction } from "@/lib/actions/order.actions";

type SyncResult =
  | { success: true; synced: number; errors: number }
  | { success: false; error: string };

export function SyncButton() {
  const [result, setResult] = useState<SyncResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSync() {
    setResult(null);
    startTransition(async () => {
      const res = await syncOrdersAction(50);
      setResult(res as SyncResult);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleSync}
        disabled={isPending}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Syncing…" : "Sync from Shopify"}
      </Button>

      {result && (
        <span className="text-sm">
          {!result.success ? (
            <span className="text-red-600">{result.error}</span>
          ) : (
            <span className="text-muted-foreground">
              Synced {result.synced} orders
              {result.errors > 0 && (
                <span className="text-red-500"> ({result.errors} errors)</span>
              )}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
