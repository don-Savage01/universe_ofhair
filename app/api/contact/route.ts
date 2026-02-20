// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

    // Email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Add TLS options for better deliverability
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Test SMTP connection
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      return NextResponse.json(
        {
          error: "Email server connection failed",
          details: verifyError.message,
        },
        { status: 500 },
      );
    }

    // Email content
    const mailOptions = {
      from: `Hair Universe <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL || "your-email@gmail.com",
      replyTo: email,
      subject: `Contact Form: ${topic} - Hair Universe`,
      // Anti-spam headers
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
        "X-Mailer": "Hair Universe Website",
        Precedence: "bulk",
      },
      // Priority settings
      priority: "high",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission - Hair Universe</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef; border-top: none; }
            h1 { color: white; margin: 0; font-size: 28px; }
            h2 { color: #495057; margin-top: 0; }
            h3 { color: #495057; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            td { padding: 12px 15px; border-bottom: 1px solid #e9ecef; }
            .label { font-weight: 600; color: #495057; width: 120px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
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
                <td>${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td class="label">Email</td>
                <td>
                  <a href="mailto:${email}" style="color: #667eea; text-decoration: none; font-weight: 500;">${email}</a>
                </td>
              </tr>
              <tr>
                <td class="label">Phone</td>
                <td>${phone || "Not provided"}</td>
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
              <p style="margin: 5px 0; font-size: 11px;">
                If you believe this email was sent in error, please disregard it.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
CONTACT FORM SUBMISSION - Hair Universe
========================================

CONTACT DETAILS:
----------------
Name:    ${firstName} ${lastName}
Email:   ${email}
Phone:   ${phone || "Not provided"}
Topic:   ${topic}

MESSAGE:
--------
${message}

---
This message was sent from the Hair Universe contact form.
Date: ${new Date().toLocaleString()}
Thank you for contacting Hair Universe!
      `.trim(),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Also send a backup email with different subject to avoid spam filters
    try {
      const backupMail = {
        from: `Hair Universe <${process.env.EMAIL_USER}>`,
        to: "ksley4040@gmail.com",
        subject: `[Contact Received] ${firstName} ${lastName} - ${topic}`,
        text: `Backup notification: Contact form submission received from ${firstName} ${lastName} (${email}). Topic: ${topic}`,
      };

      await transporter.sendMail(backupMail);
    } catch (backupError) {
      // Silently fail - backup email is optional
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Message sent successfully! Please check your inbox (and spam folder).",
        messageId: info.messageId,
      },
      { status: 200 },
    );
  } catch (error) {
    let errorMessage = "Failed to send message";
    let errorDetails = "Unknown error";

    if (error instanceof Error) {
      errorDetails = error.message;

      // Common error patterns
      if (error.message.includes("Invalid login")) {
        errorMessage =
          "Invalid email credentials. Please check your app password.";
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Cannot connect to email server.";
      } else if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Email server refused connection.";
      } else if (error.message.includes("Unexpected socket close")) {
        errorMessage = "Connection to email server was closed unexpectedly.";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    );
  }
}

// Optional: Add CORS headers if needed
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
