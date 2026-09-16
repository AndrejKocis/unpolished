import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/constants";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > MAX_REQUESTS_PER_WINDOW;
}

type InquiryBody = {
  type?: "inquiry" | "newsletter";
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot — musí ostať prázdne
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Príliš veľa požiadaviek, skúste neskôr." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as InquiryBody | null;
  if (!body) {
    return NextResponse.json({ error: "Neplatná požiadavka." }, { status: 400 });
  }

  // Honeypot pole vyplní iba bot — potvrdíme úspech, ale nič neodošleme.
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY nie je nastavený.");
    return NextResponse.json({ error: "Formulár je dočasne nedostupný." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    if (body.type === "newsletter") {
      if (!body.email) {
        return NextResponse.json({ error: "Chýba e-mail." }, { status: 400 });
      }
      await resend.emails.send({
        from: "unpolished <noreply@unpolished.com>",
        to: CONTACT_EMAIL,
        subject: "Nový odber noviniek",
        text: `Nová registrácia na newsletter: ${body.email}`,
      });
      return NextResponse.json({ ok: true });
    }

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Vyplňte prosím všetky polia." }, { status: 400 });
    }

    await resend.emails.send({
      from: "unpolished <noreply@unpolished.com>",
      to: CONTACT_EMAIL,
      replyTo: body.email,
      subject: `Dopyt od ${body.name}`,
      text: `${body.message}\n\nOd: ${body.name} <${body.email}>`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Odoslanie e-mailu zlyhalo:", error);
    return NextResponse.json({ error: "Odoslanie zlyhalo, skúste to prosím znova." }, { status: 502 });
  }
}
