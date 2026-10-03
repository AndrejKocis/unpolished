import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/constants";
import { composeInquiryEmail, type InquiryBody } from "@/lib/inquiry";

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

  const email = composeInquiryEmail(body);
  if ("error" in email) {
    return NextResponse.json({ error: email.error }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY nie je nastavený.");
    return NextResponse.json({ error: "Formulár je dočasne nedostupný." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "unpolished <noreply@unpolished.com>",
      to: CONTACT_EMAIL,
      ...email,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Odoslanie e-mailu zlyhalo:", error);
    return NextResponse.json({ error: "Odoslanie zlyhalo, skúste to prosím znova." }, { status: 502 });
  }
}
