import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm space-y-4 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Order Ops</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Internal order assignment dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
