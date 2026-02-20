"use client";

interface ServiceCommitmentProps {
  product: any;
  formatPrice: (price: number) => string;
  onShowDeliveryModal: () => void;
  onShowRefundModal: () => void;
  onShowPrivacyModal: () => void;
}

export default function ServiceCommitment({
  product,
  formatPrice,
  onShowDeliveryModal,
  onShowRefundModal,
  onShowPrivacyModal,
}: ServiceCommitmentProps) {
  const shippingFee = product.shippingFee || 2500;
  const deliveryText = product.deliveryText || "Jan. 22 - Feb. 04";

  return (
    <div className="mb-5 -mx-4 sm:-mx-6 lg:-mx-8 ">
      <div className="bg-gradient-to-r from-emerald-100/30 via-emerald-50/20 to-white rounded-none px-2 py-3 border border-gray-200">
        <h3 className="text-lg font-semibold text-green-600 mb-4 p-2 bg-gradient-to-r from-emerald-100/30 via-emerald-50/20 to-white">
          Service Commitment
        </h3>
        <div className="space-y-0">
          <button
            onClick={onShowDeliveryModal}
            className="w-full text-left hover:bg-gray-100 px-2 pt-0.5 pb-2 transition-colors border-b border-gray-300 last:border-b-0"
          >
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">
                  Shipping:{" "}
                  <span className="text-gray-800">
                    {formatPrice(shippingFee)}
                  </span>
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Delivery:{" "}
                  <span className="text-gray-800 font-medium">
                    {deliveryText}
                  </span>
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          <button
            onClick={onShowRefundModal}
            className="w-full text-left hover:bg-gray-100 px-2 py-3 transition-colors border-b border-gray-300 last:border-b-0"
          >
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
              <div className="flex-1">
                <p className="text-gray-800 font-medium">
                  Return&refund Policy
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>

          <button
            onClick={onShowPrivacyModal}
            className="w-full text-left hover:bg-gray-100 rounded-lg px-2 py-3 transition-colors border-b border-gray-400 last:border-b-0"
          >
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
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
              <div className="flex-1">
                <p className="text-gray-800 font-medium">
                  Security and Privacy
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Secure payment. Your data is protected and never shared.
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
