"use client";

interface ActionButtonsProps {
  isInCart: boolean;
  isOutOfStock: boolean;
  cartItemQuantity: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
}

export default function ActionButtons({
  isInCart,
  isOutOfStock,
  cartItemQuantity,
  onAddToCart,
  onBuyNow,
  onIncreaseQuantity,
  onDecreaseQuantity,
}: ActionButtonsProps) {
  return (
    <div className="mb-6">
      {isInCart ? (
        <div className="w-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
          <button
            onClick={onBuyNow}
            disabled={isOutOfStock}
            className={`w-full px-4 py-4 font-medium text-lg transition-all duration-200 ${
              isOutOfStock
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-200 via-green-500 to-emerald-700 text-white hover:bg-emerald-600 active:scale-[0.98]"
            }`}
            aria-label={isOutOfStock ? "Out of stock" : "Buy now"}
          >
            {isOutOfStock ? "Out of Stock" : "Buy Now"}
          </button>
        </div>
      ) : (
        <div className="flex w-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 px-4 py-4 font-medium text-lg transition-all duration-200 border-r border-white/30 ${
              isOutOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400"
                : "bg-gradient-to-r from-pink-500 via-pink-400 to-pink-400 text-white hover:bg-pink-600 active:scale-[0.98]"
            }`}
            aria-label={isOutOfStock ? "Out of stock" : "Add to cart"}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>

          <button
            onClick={onBuyNow}
            disabled={isOutOfStock}
            className={`flex-1 px-4 py-4 font-medium text-lg transition-all duration-200 ${
              isOutOfStock
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-200 via-green-500 to-emerald-700 text-white hover:bg-emerald-600 active:scale-[0.98]"
            }`}
            aria-label={isOutOfStock ? "Out of stock" : "Buy now"}
          >
            {isOutOfStock ? "Out of Stock" : "Buy Now"}
          </button>
        </div>
      )}
    </div>
  );
}
