import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-muted-foreground">Order not found</p>
      <Button variant="outline" size="sm">
        <Link href="/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}
