"use client";

import { useRef, useEffect } from "react";

interface ProductServiceModalsProps {
  showDeliveryModal: boolean;
  showRefundModal: boolean;
  showPrivacyModal: boolean;
  onCloseDeliveryModal: () => void;
  onCloseRefundModal: () => void;
  onClosePrivacyModal: () => void;
  product: any; // Add product prop
}

export default function ProductServiceModals({
  showDeliveryModal,
  showRefundModal,
  showPrivacyModal,
  onCloseDeliveryModal,
  onCloseRefundModal,
  onClosePrivacyModal,
  product, // Destructure product
}: ProductServiceModalsProps) {
  const deliveryModalRef = useRef<HTMLDivElement>(null);
  const refundModalRef = useRef<HTMLDivElement>(null);
  const privacyModalRef = useRef<HTMLDivElement>(null);

  // Get shipping fee from product or default
  const shippingFee = product?.shippingFee || 2500;
  const deliveryText = product?.deliveryText || "Jan. 22 - Feb. 04";

  // Format price function
  const formatPrice = (price: number) => {
    return `NGN ${price.toLocaleString()}`;
  };

  // Add this to show overlay when any modal is open
  const showOverlay = showDeliveryModal || showRefundModal || showPrivacyModal;

  // Close modal when clicking on overlay
  const handleOverlayClick = () => {
    if (showDeliveryModal) onCloseDeliveryModal();
    if (showRefundModal) onCloseRefundModal();
    if (showPrivacyModal) onClosePrivacyModal();
  };

  // Close modal when pressing Escape key - FIXED: Added all dependencies
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showDeliveryModal) onCloseDeliveryModal();
        if (showRefundModal) onCloseRefundModal();
        if (showPrivacyModal) onClosePrivacyModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [
    showDeliveryModal,
    showRefundModal,
    showPrivacyModal,
    onCloseDeliveryModal,
    onCloseRefundModal,
    onClosePrivacyModal,
  ]);

  return (
    <>
      {/* Dark tinted overlay - CLICKABLE to close modal */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-60 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 cursor-pointer"
          onClick={handleOverlayClick}
        />
      )}

      {/* Delivery Information Modal */}
      {showDeliveryModal && (
        <div
          ref={deliveryModalRef}
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-70 bg-white w-full max-w-md rounded-t-2xl pointer-events-auto shadow-2xl border border-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-0">
            {/* Header with full width background */}
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Shipping & Delivery
                </h3>
                <button
                  onClick={onCloseDeliveryModal}
                  className="text-white/90 hover:text-white p-1 rounded-full hover:bg-white/25 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-1">
                    Estimated Delivery
                  </h4>
                  <p className="text-gray-700">
                    <span className="text-black font-medium">
                      {deliveryText}
                    </span>
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Via Hair Universe Standard Shipping
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-1">
                    Shipping Cost
                  </h4>
                  <p className="text-gray-700">
                    <span className="text-black font-medium">
                      {formatPrice(shippingFee)}
                    </span>
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Tracking Available
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1.5">
                    Real-time tracking updates via email/SMS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return and Refund Policy Modal */}
      {showRefundModal && (
        <div
          ref={refundModalRef}
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-70 bg-white w-full max-w-md rounded-t-2xl pointer-events-auto shadow-2xl border border-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-0">
            {/* Header with full width background */}
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Hair Universe Commitment
                </h3>
                <button
                  onClick={onCloseRefundModal}
                  className="text-white/90 hover:text-white p-1 rounded-full hover:bg-white/25 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-1">
                    Return & Refund Policy
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Eligible for returns and refunds within the designated order
                    protection period.
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-1">
                    Refund Conditions
                  </h4>
                  <ul className="text-gray-700 space-y-1.5 text-sm">
                    <li className="flex items-start">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                      <span>Item must be in original condition</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                      <span>Original packaging included</span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                      <span>
                        Eligible within the designated order protection period
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h11a9 9 0 019 9v2M3 10l6 6m-6-6l6-6"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Hassle-Free Returns
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1.5">
                    Simple return process with prepaid shipping label
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security and Privacy Modal */}
      {showPrivacyModal && (
        <div
          ref={privacyModalRef}
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-70 bg-white w-full max-w-md rounded-t-2xl pointer-events-auto shadow-2xl border border-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-0">
            {/* Header with full width background */}
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Hair Universe Commitment
                </h3>
                <button
                  onClick={onClosePrivacyModal}
                  className="text-white/90 hover:text-white p-1 rounded-full hover:bg-white/25 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-1">
                    Security & Privacy
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    We protect your privacy and keep your personal details safe
                    and secure. Your data is encrypted and never shared with
                    third parties.
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-800 mb-1">
                    Secure Payment
                  </h4>

                  <p className="flex items-start">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                    <span>Multiple secure payment options</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                    <svg
                      className="w-4 h-4 mr-2 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Trust & Safety Guaranteed
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1.5">
                    Your security is our top priority
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
