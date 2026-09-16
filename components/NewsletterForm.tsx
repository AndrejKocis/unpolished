"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";

export function NewsletterForm() {
  const { dict } = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const email = new FormData(form).get("email");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newsletter", email }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="text-15">{dict.home.newsletterSent}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:items-end max-w-md">
      <div className="flex-1">
        <Input label={dict.common.email} name="email" type="email" required autoComplete="email" />
      </div>
      <Button type="submit" disabled={status === "sending"} fullWidthOnMobile>
        {status === "sending" ? dict.common.sending : dict.common.send}
      </Button>
      {status === "error" && (
        <p className="text-13 text-ink-muted">{dict.common.genericError}</p>
      )}
    </form>
  );
}
