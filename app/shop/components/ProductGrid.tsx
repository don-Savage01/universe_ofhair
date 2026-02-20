"use client";

import { Product } from "./types";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import ProductDetailsModal from "./ProductDetailsModal";
import OptimizedImage from "./OptimizedImage";

interface ProductGridProps {
  filteredProducts: Product[];
  openProductDetails: (product: Product) => void;
  handleAddToCart: (product: Product) => void;
  searchQuery: string;
  selectedCategory: string;
  products: Product[];
}

// Helper function to format price with commas (no decimals)
const formatPriceWithCommas = (price: number): string => {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Format price as Naira with commas
const formatPrice = (price: number) => {
  return `₦${formatPriceWithCommas(price)}`;
};

// Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="border border-gray-200 rounded-lg p-3 animate-pulse">
    <div className="bg-gray-300 rounded-lg aspect-square mb-3" />
    <div className="h-4 bg-gray-300 rounded mb-2" />
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-3" />
    <div className="h-8 bg-gray-300 rounded" />
  </div>
);

export default function ProductGrid({
  filteredProducts,
  openProductDetails,
  handleAddToCart,
  searchQuery,
  selectedCategory,
  products,
}: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Track which products are showing the remove confirmation
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState<
    number | null
  >(null);

  // Track confirmation for remove click
  const [removeConfirmation, setRemoveConfirmation] = useState<{
    isOpen: boolean;
    productId: number | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: "",
  });

  // Use cart context
  const { cart, addToCart, removeFromCart } = useCart();

  // Calculate total items in cart for badge
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Check if product is in cart (including variations)
  const isInCart = (productId: number) => {
    // Check for exact match (base product without variations)
    if (cart.some((item) => item.id === productId.toString())) return true;

    // Check for variations (product with length selection)
    return cart.some((item) => item.id.startsWith(productId.toString() + "-"));
  };

  // Get cart item ID (for removing)
  const getCartItemId = (productId: number): string | null => {
    // First check for exact match
    const exactMatch = cart.find((item) => item.id === productId.toString());
    if (exactMatch) return exactMatch.id;

    // Check for variations
    const variationMatch = cart.find((item) =>
      item.id.startsWith(productId.toString() + "-"),
    );
    return variationMatch ? variationMatch.id : null;
  };

  // Handle adding base product to cart (without variations)
  const handleAddToCartClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock) {
      // Add base product without variations
      addToCart({
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        features: product.features || [],
        description: product.description || "",
        rating: product.rating || 0,
        inStock: product.inStock,
        category: product.category || "",
      });
    }
  };

  // Handle "In Cart" button click - show split button
  const handleInCartClick = (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRemoveConfirmation(productId);
  };

  // Handle remove click - show confirmation
  const handleRemoveClick = (
    productId: number,
    productName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setRemoveConfirmation({
      isOpen: true,
      productId,
      productName,
    });
  };

  // Handle confirm remove
  const handleConfirmRemove = () => {
    if (removeConfirmation.productId) {
      const cartItemId = getCartItemId(removeConfirmation.productId);
      if (cartItemId) {
        removeFromCart(cartItemId);
      }
      setShowRemoveConfirmation(null);
    }
    setRemoveConfirmation({
      isOpen: false,
      productId: null,
      productName: "",
    });
  };

  // Handle cancel remove confirmation
  const handleCancelRemoveConfirmation = () => {
    setRemoveConfirmation({
      isOpen: false,
      productId: null,
      productName: "",
    });
  };

  // Handle cancel (go back to "In Cart" button)
  const handleCancelClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowRemoveConfirmation(null);
  };

  // Get first image for thumbnail
  const getFirstImage = (product: Product) => {
    return product.images && product.images.length > 0 ? product.images[0] : "";
  };

  // Calculate discount percentage
  const getDiscountPercentage = (product: Product) => {
    if (!product.originalPrice) return 0;
    const discount =
      ((product.originalPrice - product.price) / product.originalPrice) * 100;
    return Math.round(discount);
  };

  // Handle opening product modal with URL update - ONLY for in-stock products
  const handleOpenProduct = (product: Product) => {
    // ONLY allow opening if product is in stock
    if (product.inStock) {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("product", product.id.toString());
      router.push(`?${params.toString()}`, { scroll: false });
      setSelectedProduct(product);

      // Simulate loading for better UX
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  // Handle closing product modal with URL update
  const handleCloseProduct = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("product");
    router.push(`?${params.toString()}`, { scroll: false });
    setSelectedProduct(null);
  };

  // Initialize product from URL on page load
  useEffect(() => {
    const productId = searchParams.get("product");
    if (productId) {
      const product = products.find((p) => p.id.toString() === productId);
      if (product && product.inStock) {
        // Added inStock check here too
        setLoading(true);
        setSelectedProduct(product);

        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    }
  }, [searchParams, products]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (selectedProduct) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedProduct]);

  // Hide scroll when modal is open
  useEffect(() => {
    if (selectedProduct || removeConfirmation.isOpen) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, [selectedProduct, removeConfirmation.isOpen]);

  return (
    <div className="w-full">
      {/* Remove Confirmation Modal */}
      {removeConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancelRemoveConfirmation}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-sm shadow-2xl max-w-md w-full p-5 animate-fadeIn">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Remove from Cart?
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Are you sure you want to remove{" "}
                <span className="font-medium">
                  "{removeConfirmation.productName}"
                </span>{" "}
                from your cart?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelRemoveConfirmation}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="flex-1 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      {selectedProduct && !loading && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={handleCloseProduct}
          cartItemCount={cartItemCount}
          isInCart={isInCart(selectedProduct.id)}
        />
      )}

      {/* No Results Message */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl mb-8 animate-fadeIn">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            {searchQuery
              ? `We couldn't find any products matching "${searchQuery}". Try different keywords or browse by category.`
              : "No products available in this category. Please try another category."}
          </p>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("search");
              params.delete("category");
              router.push(`?${params.toString()}`);
            }}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Thumbnail Gallery View */}
      {filteredProducts.length > 0 && !loading && (
        <>
          <div className="mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredProducts.map((product, index) => {
                const discountPercentage = getDiscountPercentage(product);
                const inCart = isInCart(product.id);
                const firstImage = getFirstImage(product);
                const showingConfirmation =
                  showRemoveConfirmation === product.id;

                return (
                  <div
                    key={product.id}
                    className={`group bg-white shadow-md hover:shadow-xl rounded-lg p-3 flex flex-col relative transition-all duration-300 ${
                      !product.inStock
                        ? "opacity-80 cursor-default" // Changed from cursor-pointer to cursor-default
                        : "cursor-pointer hover:scale-[1.02] hover:border-pink-200 hover:shadow-lg"
                    }`}
                    onClick={() =>
                      product.inStock && handleOpenProduct(product)
                    } // Only clickable if in stock
                    role={product.inStock ? "button" : "presentation"} // Change role based on stock
                    tabIndex={product.inStock ? 0 : -1} // Only tabbable if in stock
                    onKeyDown={(e) => {
                      if (
                        product.inStock &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        handleOpenProduct(product);
                      }
                    }}
                    aria-label={
                      product.inStock
                        ? `View details for ${product.name}`
                        : `${product.name} - Out of stock`
                    }
                  >
                    {/* Image in Grid Item */}
                    <div className="relative bg-white rounded-lg overflow-hidden mb-3 aspect-square group/image-hover">
                      {firstImage ? (
                        <div className="relative w-full h-full">
                          {/* FIX: Added cache busting to prevent stale images */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <OptimizedImage
                            src={firstImage}
                            alt={product.name}
                            thumbnail={true}
                            priority={index < 6} // Prioritize first 6 images
                            className={`p-2 transition-transform duration-300 ${
                              product.inStock
                                ? "group-hover/image-hover:scale-105"
                                : ""
                            } ${
                              !product.inStock
                                ? "filter grayscale blur-[0.4px]"
                                : ""
                            }`}
                            width={400}
                            quality={60}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 002-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}

                      {discountPercentage > 0 && product.inStock && (
                        <div className="absolute top-2 right-2 z-20">
                          <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            -{discountPercentage}%
                          </span>
                        </div>
                      )}

                      {!product.inStock && (
                        <div className="absolute top-2 right-2 z-20">
                          <span className="bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Name - FIXED: Added line-clamp-2 for truncation */}
                    <h3
                      className={`text-sm font-medium line-clamp-2 mb-1.5 text-left min-h-10 flex-1 ${
                        !product.inStock ? "text-gray-500" : "text-gray-800"
                      }`}
                      title={product.name} // Shows full name on hover
                    >
                      {product.name}
                    </h3>

                    {/* Price - FIXED: No .00 at the end */}
                    <div className="text-left mb-3">
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-bold ${
                            !product.inStock ? "text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-500 line-through mt-1">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Button or Split Remove/Cancel Button */}
                    {!inCart ? (
                      <button
                        onClick={(e) => handleAddToCartClick(product, e)}
                        disabled={!product.inStock}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          product.inStock
                            ? "bg-pink-500 text-white hover:bg-pink-600 active:scale-95"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        aria-label={
                          product.inStock ? "Add to cart" : "Out of stock"
                        }
                      >
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </button>
                    ) : showingConfirmation ? (
                      <div className="flex h-9 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveClick(product.id, product.name, e);
                          }}
                          className="flex-1 bg-red-500 text-white text-xs font-semibold
                                   hover:bg-red-400 transition-colors
                                   flex items-center justify-center gap-1
                                   text-center px-2" // Added px-2 for padding
                          aria-label="Remove from cart"
                        >
                          Remove
                        </button>

                        <div className="w-px bg-red-600" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelClick(e);
                          }}
                          className="flex-1 bg-pink-500 text-white text-xs font-semibold
                                   hover:bg-pink-400 transition-colors
                                   flex items-center justify-center gap-1
                                   text-center px-2" // Added px-2 for padding
                          aria-label="Cancel remove"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleInCartClick(product.id, e)}
                        className="w-full py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-200 hover:border-green-300 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                        aria-label="In cart, click to remove"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        In Cart
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Count Footer */}
          <div className="text-center text-gray-500 text-sm mb-2">
            Showing {filteredProducts.length} of {products.length} products
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </div>
        </>
      )}
    </div>
  );
}
