"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <h1 className="text-sm font-medium text-muted-foreground">{title}</h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="gap-2 text-muted-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </header>
  );
}
