import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 },
      );
    }

    console.log("🔍 Verifying payment reference:", reference);

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("❌ Missing Paystack secret key");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Call Paystack API to verify transaction
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    console.log("📊 Paystack verification response:", {
      status: data.status,
      message: data.message,
      reference: data.data?.reference,
      amount: data.data?.amount,
      status: data.data?.status,
    });

    if (data.status && data.data.status === "success") {
      // Payment verified successfully
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          reference: data.data.reference,
          amount: data.data.amount / 100, // Convert from kobo to Naira
          currency: data.data.currency,
          paidAt: data.data.paid_at,
          customer: {
            email: data.data.customer.email,
            name: data.data.customer.name || "",
          },
          metadata: data.data.metadata || {},
        },
      });
    } else {
      // Payment verification failed
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Payment verification failed",
          status: data.data?.status || "failed",
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("❌ Verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server error during verification",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
