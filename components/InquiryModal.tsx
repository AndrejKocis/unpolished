"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CONTACT_EMAIL } from "@/lib/constants";
import { useLocale } from "@/components/LocaleProvider";
import { sendInquiry, type InquiryBody } from "@/lib/inquiry";

type Props = {
  open: boolean;
  onClose: () => void;
  prefilledMessage?: string;
};

export function InquiryModal({ open, onClose, prefilledMessage = "" }: Props) {
  const { dict } = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as InquiryBody;

    try {
      await sendInquiry({ ...data, type: "inquiry" });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.watchDetail.writeToUs}
      className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-line p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="font-serif text-24">{dict.watchDetail.writeToUs}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="text-15 underline underline-offset-[3px]"
          >
            {dict.common.close}
          </button>
        </div>

        {status === "sent" ? (
          <p className="text-15">{dict.watchDetail.inquirySent}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input label={dict.common.name} name="name" type="text" required autoComplete="name" />
            <Input label={dict.common.email} name="email" type="email" required autoComplete="email" />
            <Textarea
              label={dict.common.message}
              name="message"
              required
              rows={4}
              defaultValue={prefilledMessage}
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
        )}
      </div>
    </div>
  );
}
