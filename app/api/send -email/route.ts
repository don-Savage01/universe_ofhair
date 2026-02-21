import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, from } = await request.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 },
      );
    }

    console.log("📧 Sending email via Resend:", { to, subject });

    const { data, error } = await resend.emails.send({
      from: from || "HAIR Universe <onboarding@resend.dev>",
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    console.log("✅ Email sent successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("❌ Email sending error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
