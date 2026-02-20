"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Separate component that uses useSearchParams and useRouter
function TermsContent() {
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
          <h1 className="text-sm font-bold text-gray-900 mb-4">
            Terms & Conditions
          </h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Agreement to Terms</span>
              </h2>
              <p className="text-gray-700">
                By completing your purchase on HAIR Universe, you agree to be
                bound by these Terms and Conditions. If you do not agree with
                any part of these terms, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Products & Pricing</span>
              </h2>
              <p className="text-gray-700 mb-2">
                Our collection is crafted from the highest quality materials and
                premium-grade standards. We provide precise visual
                representations and detailed descriptions to ensure every
                product is an exact reflection of our superior quality
                standards.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Payment Terms</span>
              </h2>
              <p className="text-gray-700 mb-2">
                We accept payments. Full payment is required before order
                processing begins.
              </p>
              <p className="text-gray-700">
                All transactions are secure and encrypted. We do not store any
                credit card information on our servers.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Shipping & Delivery</span>
              </h2>
              <p className="text-gray-700">
                We are not responsible for delays caused by customs clearance,
                courier partners, or unforeseen circumstances.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Returns & Refunds</span>
              </h2>
              <p className="text-gray-700 mb-2">
                Due to hygiene reasons, all sales are FINAL. We do not accept
                returns or exchanges for change of mind.
              </p>
              <p className="text-gray-700 mb-2">
                For defective items: Please contact us within 48 hours of
                delivery with clear photos showing the defect. We will assess
                and provide a resolution.
              </p>
              <p className="text-gray-700">
                Refunds, if approved, will be processed to your original payment
                method within 5-7 business days.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Limitation of Liability</span>
              </h2>
              <p className="text-gray-700">
                HAIR Universe shall not be liable for any indirect, incidental,
                special, or consequential damages arising from the use of our
                products or services.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Governing Law</span>
              </h2>
              <p className="text-gray-700">
                These terms shall be governed by the laws of the Federal
                Republic of Nigeria. Any disputes shall be resolved exclusively
                in the courts of law.
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

// Main export with Suspense boundary
export default function TermsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      }
    >
      <TermsContent />
    </Suspense>
  );
}
