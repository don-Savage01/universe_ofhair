import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const adminEmails = process.env.RECEIVER_EMAIL || "ksley4039@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, topic, message } =
      await request.json();

    if (!firstName || !lastName || !email || !topic || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const fullName = `${firstName} ${lastName}`;
    const phoneDisplay = phone || "Not provided";

    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none; }
          h1 { color: white; margin: 0; font-size: 28px; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
          td { padding: 12px 15px; border-bottom: 1px solid #e9ecef; }
          .label { font-weight: 600; color: #495057; width: 120px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Hair Universe</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">New Contact Form Submission</p>
        </div>
        <div class="content">
          <table>
            <tr><td class="label">Name</td><td>${fullName}</td></tr>
            <tr><td class="label">Email</td><td><a href="mailto:${email}" style="color:#ec4899;">${email}</a></td></tr>
            <tr><td class="label">Phone</td><td>${phoneDisplay}</td></tr>
            <tr><td class="label">Topic</td><td>${topic}</td></tr>
          </table>
          <div class="message-box">
            <strong>Message:</strong><br/><br/>
            ${message.replace(/\n/g, "<br>")}
          </div>
          <p style="margin-top:20px; font-size:13px; color:#6c757d;">
            Sent: ${new Date().toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </body>
      </html>
    `;

    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none; }
          h1 { color: white; margin: 0; font-size: 24px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Thank You for Contacting Us!</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>We've received your message and will get back to you as soon as possible.</p>
          <div class="message-box">
            <p><strong>Topic:</strong> ${topic}</p>
            <p><strong>Your message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p style="margin-top: 20px;">Best regards,<br/><strong>The Hair Universe Team</strong></p>
        </div>
      </body>
      </html>
    `;

    // Send to admins
    await transporter.sendMail({
      from: `"Hair Universe" <${process.env.EMAIL_USER}>`,
      to: adminEmails,
      replyTo: email,
      subject: `New Contact: ${topic} from ${fullName}`,
      html: adminHtml,
    });

    // Send auto-reply to customer
    await transporter.sendMail({
      from: `"Hair Universe" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message - Hair Universe",
      html: customerHtml,
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send message" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
