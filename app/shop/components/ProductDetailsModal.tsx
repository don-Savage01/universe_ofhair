"use client";

import { Product } from "./types";
import Link from "next/link";
import ProductImageGallery from "./ProductImageGallery";
import { useState } from "react";
import ProductDetailsModalContent from "./ProductDetailsModalContent";
import ProductServiceModals from "./ProductServiceModals";

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  cartItemCount: number;
  isInCart?: boolean;
  cartQuantity?: number;
  onUpdateCart?: (product: Product, newQuantity: number) => void;
  onRemoveFromCart?: (productId: number) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  cartItemCount,
  isInCart = false,
  cartQuantity = 0,
  onUpdateCart,
  onRemoveFromCart,
}: ProductDetailsModalProps) {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Close modal when clicking anywhere on the modal background
  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (showRefundModal) setShowRefundModal(false);
      if (showPrivacyModal) setShowPrivacyModal(false);
      if (showDeliveryModal) setShowDeliveryModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-linear-to-br from-pink-100 via-rose-50 to-pink-100 overflow-y-auto">
      {/* Header with Cart Icon */}
      <div className="sticky top-0 z-50 bg-white px-4 py-2 flex items-center border-b border-gray-200 shadow-md">
        <button
          onClick={onClose}
          className="flex items-center text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Close product view"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div className="flex-1 flex justify-center">
          <h1
            className={`text-lg font-semibold line-clamp-1 text-center ${
              product.inStock === false ? "text-gray-500" : "text-gray-800"
            }`}
          >
            {product.name}
          </h1>
        </div>
        <Link
          href="/cart"
          className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors"
          aria-label="View cart"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {cartItemCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
              {cartItemCount}
            </div>
          )}
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 bg-white">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <div className="rounded-xl p-4 md:p-6 h-full">
              <ProductImageGallery
                images={product.images || []}
                productName={product.name}
                showThumbnails={true}
                inStock={product.inStock}
                videoUrl={product.video}
              />
            </div>
          </div>

          {/* Product Details - Imported continuation */}
          <ProductDetailsModalContent
            product={product}
            isInCart={isInCart}
            onClose={onClose}
            onShowDeliveryModal={() => setShowDeliveryModal(true)}
            onShowRefundModal={() => setShowRefundModal(true)}
            onShowPrivacyModal={() => setShowPrivacyModal(true)}
          />
        </div>
      </div>

      {/* Modals Overlay */}
      {(showDeliveryModal || showRefundModal || showPrivacyModal) && (
        <div
          className="fixed inset-0 z-70 bg-white/80 flex items-end justify-center transition-opacity duration-300"
          onClick={handleModalClick}
        >
          <ProductServiceModals
            showDeliveryModal={showDeliveryModal}
            showRefundModal={showRefundModal}
            showPrivacyModal={showPrivacyModal}
            onCloseDeliveryModal={() => setShowDeliveryModal(false)}
            onCloseRefundModal={() => setShowRefundModal(false)}
            onClosePrivacyModal={() => setShowPrivacyModal(false)}
            product={product}
          />
        </div>
      )}
    </div>
  );
}
