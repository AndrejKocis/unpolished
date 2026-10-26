import { CONTACT_EMAIL, IS_STATIC_EXPORT, WEB3FORMS_ACCESS_KEY } from "@/lib/constants";

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

// Odošle formulár z prehliadača. Statický export nemá server, preto správu doručí Web3Forms;
// bez jeho kľúča otvorí e-mailového klienta s predvyplnenou správou. Inak ju pošle na /api/inquiry.
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

  if (WEB3FORMS_ACCESS_KEY) {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: email.subject,
        from_name: body.name || "unpolished.cz",
        email: body.email,
        replyto: email.replyTo,
        message: email.text,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { success?: boolean };
    if (!res.ok || !json.success) throw new Error("request failed");
    return;
  }

  const params = new URLSearchParams({ subject: email.subject, body: email.text });
  window.location.href = `mailto:${CONTACT_EMAIL}?${params.toString().replaceAll("+", "%20")}`;
}
