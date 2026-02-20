import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, amount, metadata } = await request.json();

    if (!email || !amount) {
      return NextResponse.json(
        { error: "Email and amount are required" },
        { status: 400 },
      );
    }

    console.log("🚀 Initializing Paystack transaction:", {
      email,
      amount,
      metadata,
    });

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount),
          currency: "NGN",
          metadata,
          callback_url: `${request.nextUrl.origin}/payment-success`,
          // ✅ ADD THIS LINE - This is what's missing!
          cancel_url: `${request.nextUrl.origin}/checkout/cancelled`,
        }),
      },
    );

    const data = await response.json();

    console.log("✅ Paystack initialization response:", {
      status: data.status,
      message: data.message,
      hasAuthUrl: !!data.data?.authorization_url,
      reference: data.data?.reference,
    });

    if (data.status && data.data?.authorization_url) {
      return NextResponse.json({
        success: true,
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
        access_code: data.data.access_code,
      });
    } else {
      throw new Error(data.message || "Failed to initialize payment");
    }
  } catch (error: any) {
    console.error("❌ Paystack initialization error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Payment initialization failed",
      },
      { status: 500 },
    );
  }
}
