"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("officer@example.com");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await signIn("credentials", { redirect: false, email, password });
    setSubmitting(false);
    if (!res || res.error) {
      toast({
        title: "Đăng nhập thất bại",
        description: "Email hoặc mật khẩu không đúng.",
        variant: "destructive"
      });
      return;
    }
    const callback = search.get("callbackUrl") ?? "/templates";
    router.push(callback);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Đăng nhập</h1>
        <p className="mt-1 text-sm text-muted-foreground">Document Violation Manager</p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded bg-muted" />}>
        <LoginForm />
      </Suspense>
      <p className="text-xs text-muted-foreground">
        Demo: <code>officer@example.com</code> / <code>Password123!</code>
      </p>
    </div>
  );
}
