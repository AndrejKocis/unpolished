"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";
import { sendInquiry } from "@/lib/inquiry";

export function NewsletterForm() {
  const { dict } = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");

    try {
      await sendInquiry({ type: "newsletter", email });
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
