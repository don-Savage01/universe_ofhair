"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function PrivacyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.refresh();
  }, [router]);

  // Get the return path from URL params or default to checkout
  const returnPath = searchParams.get("return") || "/checkout";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h1 className="text-sm font-bold text-gray-900 mb-3">
            Privacy Policy
          </h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 mb-2">
                We collect the following information to process your orders and
                provide better service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
                <li>
                  <strong>Identity Data:</strong> First name, last name
                </li>
                <li>
                  <strong>Contact Data:</strong> Email address, phone number,
                  delivery address
                </li>
                <li>
                  <strong>Transaction Data:</strong> Order details, payment
                  amount, product selections
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                2. How We Collect Your Data
              </h2>
              <p className="text-gray-700 mb-2 text-sm">
                <strong>Direct interactions:</strong> You provide this when
                filling checkout forms.
              </p>
              <p className="text-gray-700 mb-1 text-sm">
                <strong>Automated technologies:</strong> Cookies and similar
                tracking technologies.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li> To process and deliver your orders</li>
                <li> To send order confirmations and shipping updates</li>
                <li> To communicate with you about your purchase</li>
                <li> To improve our website and customer service</li>
                <li> To comply with legal obligations</li>
                <li className=" text-sm">
                  We do NOT sell your personal information to third parties
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                4. Data Sharing & Third Parties
              </h2>
              <p className="text-gray-700 mb-2">
                We only share your data with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
                <li>
                  <strong>Courier partners:</strong> To deliver your order
                  (name, address, phone only)
                </li>
                <li>
                  <strong>Email service:</strong> To send order confirmations
                  (Gmail/Google)
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                5. Data Security
              </h2>
              <p className="text-gray-700 mb-1 text-sm">
                We implement industry-standard security measures:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>256-bit SSL encryption on all pages</li>
                <li>PCI DSS compliant payment processing</li>
                <li>Restricted access to personal data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                6. Your Privacy Rights
              </h2>
              <p className="text-gray-700 mb-1">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
                <li>
                  <strong>Access</strong> the personal data we hold about you
                </li>
                <li>
                  <strong>Correct</strong> inaccurate or incomplete data
                </li>
                <li>
                  <strong>Request deletion</strong> of your personal data
                </li>
                <li>
                  <strong>Withdraw consent</strong> at any time
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                8. Contact Us
              </h2>
              <p className="text-gray-700 text-sm">
                If you have questions about this Privacy Policy:
              </p>
              <p className="text-gray-700 mt-2 text-sm">
                Email: Balogunolamide616@gmail.com
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <Link
              href={returnPath}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
