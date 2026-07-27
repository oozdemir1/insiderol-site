import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

const CAPTCHA_REQUIRED = process.env.NODE_ENV === "production";

const RATE_LIMIT_MAX_SUBMISSIONS = 2;
const RATE_LIMIT_WINDOW_HOURS = 5;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 255;
const SUBJECT_MAX_LENGTH = 150;
const MESSAGE_MAX_LENGTH = 500;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

async function verifyTurnstileToken(token: string) {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
      }),
    }
  );

  const data = await response.json();
  return data.success === true;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, subject, message, turnstileToken } = body;

  if (!email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Lütfen tüm zorunlu alanları doldurun." },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json(
      { error: "Lütfen geçerli bir e-posta adresi girin." },
      { status: 400 }
    );
  }

  if (
    (name?.length || 0) > NAME_MAX_LENGTH ||
    email.length > EMAIL_MAX_LENGTH ||
    subject.length > SUBJECT_MAX_LENGTH ||
    message.length > MESSAGE_MAX_LENGTH
  ) {
    return NextResponse.json(
      { error: "Bir veya daha fazla alan izin verilen uzunluğu aşıyor." },
      { status: 400 }
    );
  }

  if (CAPTCHA_REQUIRED) {
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Lütfen captcha doğrulamasını tamamlayın." },
        { status: 400 }
      );
    }

    const captchaValid = await verifyTurnstileToken(turnstileToken);

    if (!captchaValid) {
      return NextResponse.json(
        { error: "Captcha doğrulaması başarısız, lütfen tekrar deneyin." },
        { status: 400 }
      );
    }
  }

  const supabase = createAdminClient();
  const ip = getClientIp(request);

  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { count } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .gte("created_at", windowStart);

  if ((count || 0) >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return NextResponse.json(
      {
        error:
          "Kısa sürede çok fazla mesaj gönderdiniz. Lütfen birkaç saat sonra tekrar deneyin.",
      },
      { status: 429 }
    );
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: name?.trim() || null,
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    ip_address: ip,
  });

  if (error) {
    return NextResponse.json(
      { error: "Mesaj gönderilemedi, lütfen tekrar deneyin." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
