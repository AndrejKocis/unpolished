import { CONTACT_EMAIL, IS_STATIC_EXPORT } from "@/lib/constants";

export type InquiryBody = {
  type?: "inquiry" | "newsletter";
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot — musí ostať prázdne
};

export type InquiryEmail = { subject: string; text: string; replyTo?: string };

// Obsah e-mailu pre dopyt/newsletter — rovnaký pre API (Resend) aj mailto v statickom exporte.
// Vráti chybovú hlášku, ak chýbajú povinné polia.
export function composeInquiryEmail(body: InquiryBody): InquiryEmail | { error: string } {
  if (body.type === "newsletter") {
    if (!body.email) return { error: "Chýba e-mail." };
    return { subject: "Nový odber noviniek", text: `Nová registrácia na newsletter: ${body.email}` };
  }
  if (!body.name || !body.email || !body.message) {
    return { error: "Vyplňte prosím všetky polia." };
  }
  return {
    subject: `Dopyt od ${body.name}`,
    text: `${body.message}\n\nOd: ${body.name} <${body.email}>`,
    replyTo: body.email,
  };
}

// Odošle formulár z prehliadača. Statický export nemá server, preto otvorí e-mailového
// klienta s predvyplnenou správou; inak ju pošle na /api/inquiry.
export async function sendInquiry(body: InquiryBody): Promise<void> {
  if (!IS_STATIC_EXPORT) {
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("request failed");
    return;
  }

  // Honeypot vyplní iba bot — potvrdíme úspech, ale nič neodošleme.
  if (body.company) return;
  const email = composeInquiryEmail(body);
  if ("error" in email) throw new Error(email.error);
  const params = new URLSearchParams({ subject: email.subject, body: email.text });
  window.location.href = `mailto:${CONTACT_EMAIL}?${params.toString().replaceAll("+", "%20")}`;
}
