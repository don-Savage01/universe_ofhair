import nodemailer from "nodemailer";

interface OrderEmailData {
  customerEmail: string;
  customerName?: string;
  orderDetails: {
    id: string;
    amount: number;
    productName: string;
    quantity: number;
    selectedLength?: string;
    selectedDensity?: string;
    selectedLaceSize?: string;
    shippingFee: number;
    deliveryText?: string;
  };
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOrderConfirmationToCustomer(data: OrderEmailData) {
  const { customerEmail, customerName, orderDetails } = data;

  const subtotal = orderDetails.amount * orderDetails.quantity;
  const total = subtotal + orderDetails.shippingFee;

  const mailOptions = {
    from: `"HAIR Universe" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Order Confirmation #${orderDetails.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ec4899;">Thank you for your order! 🎉</h2>
        <p>Hello ${customerName || "Valued Customer"},</p>
        <p>We've received your order and will process it shortly.</p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Order #${orderDetails.id}</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;"><strong>Product:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.productName}</td>
            </tr>
            ${
              orderDetails.selectedLength
                ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Length:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.selectedLength}</td>
            </tr>`
                : ""
            }
            ${
              orderDetails.selectedDensity
                ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Density:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.selectedDensity}</td>
            </tr>`
                : ""
            }
            ${
              orderDetails.selectedLaceSize
                ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Lace Size:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.selectedLaceSize}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.quantity}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Price per item:</strong></td>
              <td style="padding: 8px 0;">₦${orderDetails.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Subtotal:</strong></td>
              <td style="padding: 8px 0;">₦${subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Shipping:</strong></td>
              <td style="padding: 8px 0;">₦${orderDetails.shippingFee.toLocaleString()}</td>
            </tr>
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding: 12px 0 0 0;"><strong>Total:</strong></td>
              <td style="padding: 12px 0 0 0;"><strong style="color: #ec4899;">₦${total.toLocaleString()}</strong></td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>📦 Delivery:</strong> ${orderDetails.deliveryText || "Jan. 22 - Feb. 04"}</p>
        </div>
        
        <p>We'll notify you once your order ships.</p>
        <p style="margin-top: 30px;">Best regards,<br><strong>HAIR Universe Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Customer confirmation email sent to:", customerEmail);
  } catch (error) {
    console.error("❌ Error sending customer email:", error);
  }
}

export async function sendOrderNotificationToAdmin(data: OrderEmailData) {
  const { customerEmail, customerName, orderDetails } = data;

  const adminEmails = process.env.RECEIVER_EMAIL?.split(",") || [];
  const subtotal = orderDetails.amount * orderDetails.quantity;
  const total = subtotal + orderDetails.shippingFee;

  const mailOptions = {
    from: `"HAIR Universe Store" <${process.env.EMAIL_USER}>`,
    to: adminEmails,
    subject: `🛍️ NEW ORDER #${orderDetails.id} - ₦${total.toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ec4899;">🛒 New Order Received!</h2>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
          <p style="margin: 0; font-size: 18px;"><strong>Order #${orderDetails.id}</strong></p>
          <p style="margin: 5px 0 0 0;">Amount: <strong>₦${total.toLocaleString()}</strong></p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #374151;">👤 Customer Information</h3>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Name:</strong> ${customerName || "Not provided"}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #374151;">📦 Order Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;"><strong>Product:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.productName}</td>
            </tr>
            ${
              orderDetails.selectedLength
                ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Length:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.selectedLength}</td>
            </tr>`
                : ""
            }
            ${
              orderDetails.selectedDensity
                ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Density:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.selectedDensity}</td>
            </tr>`
                : ""
            }
            ${
              orderDetails.selectedLaceSize
                ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Lace Size:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.selectedLaceSize}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 8px 0;"><strong>Quantity:</strong></td>
              <td style="padding: 8px 0;">${orderDetails.quantity}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Unit Price:</strong></td>
              <td style="padding: 8px 0;">₦${orderDetails.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Subtotal:</strong></td>
              <td style="padding: 8px 0;">₦${subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Shipping:</strong></td>
              <td style="padding: 8px 0;">₦${orderDetails.shippingFee.toLocaleString()}</td>
            </tr>
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding: 12px 0 0 0;"><strong>TOTAL:</strong></td>
              <td style="padding: 12px 0 0 0;"><strong style="color: #ec4899; font-size: 18px;">₦${total.toLocaleString()}</strong></td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>📅 Delivery:</strong> ${orderDetails.deliveryText || "Jan. 22 - Feb. 04"}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          View full order details in your admin dashboard.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Admin notification email sent");
  } catch (error) {
    console.error("❌ Error sending admin email:", error);
  }
}
