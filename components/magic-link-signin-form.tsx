"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendMagicLinkToEmail } from "@/hooks/firebase";
import { AlertCircle, Check } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

export function MagicLinkSigninForm() {
  const sendMagicLinkMutation = useSendMagicLinkToEmail();
  const [email, setEmail] = useState("");

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMagicLinkMutation.mutate(email);
  };
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="text-muted-foreground">
          Enter your email below to receive a magic link to sign in.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="me@example.com"
            value={email}
            onChange={handleInput}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={sendMagicLinkMutation.isPending}
          className="w-full"
        >
          {sendMagicLinkMutation.isPending
            ? "Sending magic link..."
            : "Send magic link"}
        </Button>
      </form>
      {sendMagicLinkMutation.isSuccess && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertTitle>Done!</AlertTitle>
          <AlertDescription>
            Check your email for the link to sign in.
          </AlertDescription>
        </Alert>
      )}
      {sendMagicLinkMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to send the magic link!</AlertDescription>
        </Alert>
      )}
      <p className="text-xs text-muted-foreground text-center">
        By signing in, you agree to our{" "}
        <Link
          href="#"
          className="underline underline-offset-2"
          prefetch={false}
        >
          Terms of Service
        </Link>
        and{" "}
        <Link
          href="#"
          className="underline underline-offset-2"
          prefetch={false}
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
