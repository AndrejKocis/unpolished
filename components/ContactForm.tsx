"use client";

import { useState, type FormEvent } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CONTACT_EMAIL } from "@/lib/constants";
import { useLocale } from "@/components/LocaleProvider";

export function ContactForm({ defaultMessage = "" }: { defaultMessage?: string }) {
  const { dict } = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "inquiry" }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return <p className="text-15">{dict.watchDetail.inquirySent}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md">
      <Input label={dict.common.name} name="name" type="text" required autoComplete="name" />
      <Input label={dict.common.email} name="email" type="email" required autoComplete="email" />
      <Textarea
        label={dict.common.message}
        name="message"
        required
        rows={5}
        defaultValue={defaultMessage}
      />
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <Button type="submit" disabled={status === "sending"} fullWidthOnMobile>
        {status === "sending" ? dict.common.sending : dict.common.send}
      </Button>
      {status === "error" && (
        <p className="text-13 text-ink-muted">
          {dict.common.genericError} {CONTACT_EMAIL}.
        </p>
      )}
    </form>
  );
}
