"use client";

import { useState, useMemo } from "react";
import { Product } from "../types";

interface ProductInfoSectionProps {
  product: Product;
  currentPrice: number;
  currentOriginalPrice?: number;
  discountPercentage: number;
  isOutOfStock: boolean;
  formatPrice: (price: number) => string;
}

export default function ProductInfoSection({
  product,
  currentPrice,
  currentOriginalPrice,
  discountPercentage,
  isOutOfStock,
  formatPrice,
}: ProductInfoSectionProps) {
  const [isHairInfoExpanded, setIsHairInfoExpanded] = useState(false);

  const hairInfoText =
    product.hairInfo ||
    "Premium quality human hair extension with natural look and feel. Made from 100% virgin hair, can be styled, dyed, and curled. Soft texture, minimal shedding, and tangle-free. Perfect for daily wear and special occasions.";

  // ✅ Calculate word count and determine if "Read more" should be shown
  const wordCount = useMemo(() => {
    return hairInfoText.trim().split(/\s+/).length;
  }, [hairInfoText]);

  const shouldShowReadMore = wordCount > 13;

  const leftDealText = product.dealLeftText || "SUPER DEAL";
  const rightDealText = product.dealRightText || "LIMITED OFFER";
  const taxNotice =
    product.taxNotice || "Tax excluded, add at checkout if applicable";

  return (
    <>
      <div className="mb-3">
        <div className="relative">
          <p
            className={`text-gray-700 leading-relaxed transition-all duration-300 ${
              isHairInfoExpanded ? "" : "line-clamp-2"
            }`}
          >
            {hairInfoText}
          </p>

          {/* ✅ Only show "Read more" if text exceeds 13 words AND not expanded */}
          {shouldShowReadMore && !isHairInfoExpanded && (
            <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white to-transparent pl-8">
              <button
                onClick={() => setIsHairInfoExpanded(true)}
                className="text-gray-700 hover:text-gray-700 font-medium flex items-center text-sm bg-white pl-2"
              >
                Read more
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* ✅ Only show "Show less" if text was expanded AND exceeds 13 words */}
        {isHairInfoExpanded && shouldShowReadMore && (
          <button
            onClick={() => setIsHairInfoExpanded(false)}
            className="mt-2 text-gray-700 hover:text-gray-700 font-medium flex items-center text-sm"
          >
            Show less
            <svg
              className="w-4 h-4 ml-1 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center mb-3">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(product.rating || 0)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span
          className={`ml-3 ${isOutOfStock ? "text-gray-400" : "text-gray-600"}`}
        >
          {product.rating || "No rating"}
        </span>
      </div>

      <div className="mb-1.5 rounded-md overflow-hidden border border-gray-200 shadow-sm">
        <div className="flex bg-gradient-to-r from-emerald-600 to-emerald-300">
          <div className="flex-1 px-2 py-2">
            <div className="flex items-center justify-start">
              <span className="text-white font-bold text-xs">
                {leftDealText}
              </span>
            </div>
          </div>
          <div className="flex-1 px-2 py-2">
            <div className="flex items-center justify-end">
              <span className="text-white font-bold text-xs">
                {rightDealText}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white p-2">
          <div className="flex items-center justify-start gap-2 sm:gap-3">
            <div className="min-w-0">
              <span
                className={`font-sans font-semibold font-black leading-tight tracking-tight ${
                  isOutOfStock ? "text-gray-400" : "text-gray-800"
                }`}
                style={{
                  fontSize: "clamp(1.6rem, 4vw, 3rem)",
                }}
              >
                {formatPrice(currentPrice)}
              </span>
            </div>
            {discountPercentage > 0 && (
              <div className="flex flex-col items-start shrink-0">
                <span className="bg-gradient-to-r from-pink-200 via-pink-100 rounded-sm to-white text-pink-500 text-xs sm:text-sm font-bold pl-0.5 pr-5 sm:px-3 py-1 whitespace-nowrap">
                  -{discountPercentage}%
                </span>
                {currentOriginalPrice &&
                  currentOriginalPrice > currentPrice && (
                    <div className="mt-0.5 w-full text-center">
                      <span
                        className={`text-xs sm:text-xs md:text-sm line-through ${
                          isOutOfStock ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {formatPrice(currentOriginalPrice)}
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 border-t border-gray-100 pt-2 mt-1">
        {taxNotice}
      </p>
    </>
  );
}
