// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    const { firstName, lastName, email, phone, topic, message } = formData;

    // Validate required fields
    if (!firstName || !lastName || !email || !topic || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const fullName = `${firstName} ${lastName}`;
    const phoneDisplay = phone || "Not provided";

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission - Hair Universe</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none; }
          h1 { color: white; margin: 0; font-size: 28px; }
          h2 { color: #495057; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          td { padding: 12px 15px; border-bottom: 1px solid #e9ecef; }
          .label { font-weight: 600; color: #495057; width: 120px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 13px; color: #6c757d; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Hair Universe</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">New Contact Form Submission</p>
        </div>
        
        <div class="content">
          <h2>Contact Details</h2>
          
          <table>
            <tr>
              <td class="label">Name</td>
              <td>${fullName}</td>
            </tr>
            <tr>
              <td class="label">Email</td>
              <td>
                <a href="mailto:${email}" style="color: #ec4899; text-decoration: none; font-weight: 500;">${email}</a>
              </td>
            </tr>
            <tr>
              <td class="label">Phone</td>
              <td>${phoneDisplay}</td>
            </tr>
            <tr>
              <td class="label">Topic</td>
              <td>${topic}</td>
            </tr>
          </table>
          
          <div style="margin-top: 30px;">
            <h3>Message</h3>
            <div class="message-box">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 5px 0;">This message was sent from the Hair Universe contact form.</p>
            <p style="margin: 5px 0;">Sent: ${new Date().toLocaleString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            )}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Text version as fallback
    const textContent = `
CONTACT FORM SUBMISSION - Hair Universe
========================================

CONTACT DETAILS:
----------------
Name:    ${fullName}
Email:   ${email}
Phone:   ${phoneDisplay}
Topic:   ${topic}

MESSAGE:
--------
${message}

---
This message was sent from the Hair Universe contact form.
Date: ${new Date().toLocaleString()}
    `.trim();

    // Send email to admin(s)
    const adminEmails = process.env.RECEIVER_EMAIL?.split(",") || [
      "ksley4039@gmail.com",
      "balogunolamide596@gmail.com",
    ];

    // Send main admin email
    const { data: adminData, error: adminError } = await resend.emails.send({
      from: "Hair Universe <onboarding@resend.dev>",
      to: adminEmails,
      subject: `New Contact Form: ${topic} from ${fullName}`,
      html: htmlContent,
      text: textContent,
      replyTo: email,
    });

    if (adminError) {
      console.error("Resend error:", adminError);
      return NextResponse.json(
        { success: false, error: "Failed to send message" },
        { status: 500 },
      );
    }

    // Send auto-reply to customer
    const { error: customerError } = await resend.emails.send({
      from: "Hair Universe <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting Hair Universe",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ec4899;">Thank You for Contacting Hair Universe</h2>
          <p>Hello ${fullName},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p>Here's a copy of your message for your reference:</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #ec4899; margin: 20px 0;">
            <p><strong>Topic:</strong> ${topic}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p>Best regards,<br>The Hair Universe Team</p>
        </div>
      `,
    });

    if (customerError) {
      console.warn("Auto-reply failed:", customerError);
      // Don't fail the main request if auto-reply fails
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Message sent successfully! Please check your inbox (and spam folder).",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send message",
      },
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
