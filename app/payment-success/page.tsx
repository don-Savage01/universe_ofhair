"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const trxref = searchParams.get("trxref");
  const [processing, setProcessing] = useState(true);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const processOrder = async () => {
      const paymentReference = reference || trxref;

      if (!paymentReference) return;

      try {
        // 1️⃣ Verify payment
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: paymentReference }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          // 2️⃣ Get order data from sessionStorage
          const pendingOrder = sessionStorage.getItem("pendingOrder");
          const pendingCartOrder = sessionStorage.getItem("pendingCartOrder");

          let orderData = null;

          if (pendingOrder) {
            orderData = JSON.parse(pendingOrder);
          } else if (pendingCartOrder) {
            orderData = JSON.parse(pendingCartOrder);
          }

          if (orderData) {
            // 3️⃣ Create order and send emails with ALL customer data
            const orderRes = await fetch("/api/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                // ✅ Customer Information - ALL FIELDS INCLUDED
                customerEmail: orderData.email,
                customerName: orderData.fullName,
                customerPhone: orderData.phone, // ✅ PHONE NUMBER ADDED
                customerLocation: orderData.location, // ✅ LOCATION ADDED

                paymentReference: paymentReference,
                amount: orderData.price || orderData.subtotal,
                orderId: orderData.orderReference,
                quantity: orderData.quantity || 1,
                shippingFee: orderData.shippingFee,
                deliveryText: orderData.deliveryText || "Jan. 22 - Feb. 04",

                productDetails: {
                  name: orderData.productName || "Cart Order",
                  selectedLength: orderData.selectedLength || "",
                  selectedDensity: orderData.selectedDensity || "",
                  selectedLaceSize: orderData.selectedLaceSize || "",
                },

                totalWithShipping: orderData.totalAmount,

                // For cart orders
                cartItems: orderData.cartItems,
                itemCount: orderData.itemCount,
              }),
            });

            const orderResult = await orderRes.json();

            if (orderResult.success) {
              setOrderId(orderResult.orderId);
              // Clear session storage
              sessionStorage.removeItem("pendingOrder");
              sessionStorage.removeItem("pendingCartOrder");
            }
          }
        }
      } catch (error) {
        console.error("Error processing order:", error);
      } finally {
        setProcessing(false);
      }
    };

    processOrder();
  }, [reference, trxref]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-4">
          Your order has been confirmed. We've sent a confirmation email to your
          inbox.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-6">Order #: {orderId}</p>
        )}

        <Link
          href="/"
          className="inline-block w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
