import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerEmail,
      customerName,
      customerPhone,
      customerLocation,
      paymentReference,
      amount,
      orderId,
      quantity,
      shippingFee,
      deliveryText,
      productDetails,
      totalWithShipping,
      cartItems,
      itemCount,
    } = body;

    // Format price
    const formatPrice = (price: number) => {
      return `₦${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    // 1️⃣ SEND EMAIL TO ADMIN
    const adminEmails = process.env.RECEIVER_EMAIL?.split(",") || [];

    await transporter.sendMail({
      from: `"HAIR Universe Store" <${process.env.EMAIL_USER}>`,
      to: adminEmails,
      subject: `🛍️ NEW ORDER #${orderId} - ${formatPrice(totalWithShipping)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto;">
          <h2 style="color: #10b981; font-size: 26px; margin-bottom: 25px;">🛒 New Order Received!</h2>

          <!-- Order Summary Box -->
          <div style="background-color: #f0fdf4; padding: 25px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 30px;">
            <p style="font-size: 15px; font-weight: 500; margin: 0;">Order #${orderId}</p>
            <p style="font-size: 15px; margin: 10px 0 0 0;">Total Amount: <strong style="color: #10b981;">${formatPrice(totalWithShipping)}</strong></p>
          </div>

          <!-- Customer Information -->
          <div style="background-color: #f9fafb; padding: 10px; border-radius: 5px; margin-bottom: 30px;">
            <h3 style="font-size: 15px; font-weight: 500; margin: 0 0 20px 0; color: #374151;">👤 Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 120px;">Name:</td>
                <td style="padding: 8px 0;">${customerName || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0;">${customerEmail}</td>
              </tr>
              ${
                customerPhone
                  ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
                <td style="padding: 8px 0;">${customerPhone}</td>
              </tr>`
                  : ""
              }
              ${
                customerLocation
                  ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Location:</td>
                <td style="padding: 8px 0;">${customerLocation}</td>
              </tr>`
                  : ""
              }
            </table>
          </div>

          <!-- Order Details -->
          <div style="background-color: #f9fafb; padding: 5px; border-radius: 10px; margin-bottom: 30px;">
            <h3 style="font-size: 20px; font-weight: 500; margin: 0 0 25px 0; color: #374151;">📦 Order Details</h3>

            ${
              cartItems && cartItems.length > 0
                ? cartItems
                    .map(
                      (item: any, index: number) => `
                  <div style="${index < cartItems.length - 1 ? "border-bottom: 1px solid #e5e7eb;" : ""} padding: 5px 0 15px 0; margin-bottom: 15px;">
                    <p style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">${item.name}</p>
                    <table style="width: 100%; border-collapse: collapse;">
                      ${
                        item.selectedLength
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280; width: 100px;">Length:</td>
                        <td style="padding: 6px 0; text-align: right;">${item.selectedLength}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        item.selectedDensity
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Density:</td>
                        <td style="padding: 6px 0; text-align: right;">${item.selectedDensity}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        item.selectedLaceSize
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Lace Size:</td>
                        <td style="padding: 6px 0; text-align: right;">${item.selectedLaceSize}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Quantity:</td>
                        <td style="padding: 6px 0; text-align: right;">${item.quantity}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Price:</td>
                        <td style="padding: 6px 0; text-align: right; color: #10b981;">${formatPrice(item.total)}</td>
                      </tr>
                    </table>
                  </div>
                `,
                    )
                    .join("")
                : `
                  <div style="padding: 5px 0 15px 0; margin-bottom: 15px;">
                    <p style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">${productDetails.name}</p>
                    <table style="width: 100%; border-collapse: collapse;">
                      ${
                        productDetails.selectedLength
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280; width: 100px;">Length:</td>
                        <td style="padding: 6px 0; text-align: right;">${productDetails.selectedLength}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        productDetails.selectedDensity
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Density:</td>
                        <td style="padding: 6px 0; text-align: right;">${productDetails.selectedDensity}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        productDetails.selectedLaceSize
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Lace Size:</td>
                        <td style="padding: 6px 0; text-align: right;">${productDetails.selectedLaceSize}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Quantity:</td>
                        <td style="padding: 6px 0; text-align: right;">${quantity}</td>
                      </tr>
                    </table>
                  </div>
                `
            }

            <!-- Totals - FIXED ALIGNMENT -->
            <div style="margin-top: 10px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; width: 100px;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right;">${formatPrice(amount * (quantity || 1))}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Shipping:</td>
                  <td style="padding: 8px 0; text-align: right;">${formatPrice(shippingFee)}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0 0 0; font-weight: bold; font-size: 18px;">TOTAL:</td>
                  <td style="padding: 15px 0 0 0; text-align: right; font-weight: bold; color: #10b981; font-size: 18px;">${formatPrice(totalWithShipping)}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Delivery Info -->
          <div style="background-color: #fef3c7; padding: 5px; border-radius: 2px; margin-bottom: 10px;">
            <p style="margin: 0;"><strong style="color: #92400e;">Delivery:</strong> ${deliveryText}</p>
          </div>
        </div>
      `,
    });

    // 2️⃣ SEND CONFIRMATION EMAIL TO CUSTOMER
    await transporter.sendMail({
      from: `"HAIR Universe" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto;">
          <h2 style="color: #10b981; font-size: 26px; margin-bottom: 25px;">Thank you for your order! 🎉</h2>

          <p style="font-size: 15px; margin-bottom: 10px;">Hello ${customerName || "Valued Customer"},</p>
          <p style="font-size: 15px; margin-bottom: 25px;">We've received your order and will process it shortly.</p>

          <!-- Order Summary Box -->
          <div style="background-color: #f0fdf4; padding: 25px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 30px;">
            <p style="font-size: 15px; font-weight: 500; margin: 0;">Order #${orderId}</p>
            <p style="font-size: 15px; margin: 10px 0 0 0;">Total Amount: <strong style="color: #10b981;">${formatPrice(totalWithShipping)}</strong></p>
          </div>

          <!-- Order Details -->
          <div style="background-color: #f9fafb; padding: 5px; border-radius: 10px; margin-bottom: 30px;">
            <h3 style="font-size: 20px; font-weight: 500; margin: 0 0 25px 0; color: #374151;">Your Order Details</h3>

            ${
              cartItems && cartItems.length > 0
                ? cartItems
                    .map(
                      (item: any, index: number) => `
                  <div style="${index < cartItems.length - 1 ? "border-bottom: 1px solid #e5e7eb;" : ""} padding: 5px 0 15px 0; margin-bottom: 15px;">
                    <p style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">${item.name}</p>
                    <table style="width: 100%; border-collapse: collapse;">
                      ${
                        item.selectedLength
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280; width: 100px;">Length:</td>
                        <td style="padding: 6px 0; text-align: right;">${item.selectedLength}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        item.selectedDensity
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Density:</td>
                        <td style="padding: 6px 0; text-align: right;">${item.selectedDensity}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        item.selectedLaceSize
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Lace Size:</td>
                        <td style="padding: 6px 0; text-align: right;">${item.selectedLaceSize}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Quantity:</td>
                        <td style="padding: 6px 0; text-align: right;">${item.quantity}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Price:</td>
                        <td style="padding: 6px 0; text-align: right; color: #10b981;">${formatPrice(item.total)}</td>
                      </tr>
                    </table>
                  </div>
                `,
                    )
                    .join("")
                : `
                  <div style="padding: 5px 0 15px 0; margin-bottom: 15px;">
                    <p style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0;">${productDetails.name}</p>
                    <table style="width: 100%; border-collapse: collapse;">
                      ${
                        productDetails.selectedLength
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280; width: 100px;">Length:</td>
                        <td style="padding: 6px 0; text-align: right;">${productDetails.selectedLength}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        productDetails.selectedDensity
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Density:</td>
                        <td style="padding: 6px 0; text-align: right;">${productDetails.selectedDensity}</td>
                      </tr>`
                          : ""
                      }
                      ${
                        productDetails.selectedLaceSize
                          ? `
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Lace Size:</td>
                        <td style="padding: 6px 0; text-align: right;">${productDetails.selectedLaceSize}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 6px 0; color: #6b7280;">Quantity:</td>
                        <td style="padding: 6px 0; text-align: right;">${quantity}</td>
                      </tr>
                    </table>
                  </div>
                `
            }

            <!-- Totals - FIXED ALIGNMENT -->
            <div style="margin-top: 10px; padding-top: 15px; border-top: 2px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; width: 100px;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right;">${formatPrice(amount * (quantity || 1))}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Shipping:</td>
                  <td style="padding: 8px 0; text-align: right;">${formatPrice(shippingFee)}</td>
                </tr>
                <tr>
                  <td style="padding: 15px 0 0 0; font-weight: bold; font-size: 18px;">Total:</td>
                  <td style="padding: 15px 0 0 0; text-align: right; font-weight: bold; color: #10b981; font-size: 18px;">${formatPrice(totalWithShipping)}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Delivery Info -->
          <div style="background-color: #f3f4f6; padding: 5px; border-radius: 2px; margin-bottom: 15px;">
            <p style="margin: 0;"><strong style="color: #374151;">📦 Delivery:</strong> ${deliveryText}</p>
          </div>

          <p style="font-size: 15px; margin-bottom: 8px;">We'll notify you once your order ships.</p>
          <p style="font-size: 15px; margin: 0;">Best regards,<br><strong style="color: #10b981;">HAIR Universe Team</strong></p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order created and emails sent successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
