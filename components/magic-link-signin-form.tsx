"use client";

import { useSendMagicLinkToEmail } from "@/hooks/firebase";
import { ChangeEvent, MouseEvent, useState } from "react";

export default function MagicLinkSigninForm() {
  const sendMagicLinkMutation = useSendMagicLinkToEmail();
  const [email, setEmail] = useState("");

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value);
  };
  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    sendMagicLinkMutation.mutate(email);
  };

  return (
    <form>
      <input
        className="text-black"
        type="email"
        value={email}
        onChange={handleInput}
        placeholder="me@example.com"
      />
      <button
        type="submit"
        disabled={sendMagicLinkMutation.isPending}
        onClick={handleSubmit}
      >
        {sendMagicLinkMutation.isPending ? "Sending..." : "Send magic link"}
      </button>
      {sendMagicLinkMutation.isError && <div>Error sending magic link!</div>}
      {sendMagicLinkMutation.isSuccess && (
        <div>Check your email for the magic link!</div>
      )}
    </form>
  );
}
