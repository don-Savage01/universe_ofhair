"use client";

import { useCart } from "@/app/context/CartContext";
import { useProducts } from "@/app/context/ProductsContext";
import Link from "next/link";
import ProductDetailsModal from "@/app/shop/components/ProductDetailsModal";
import {
  ShoppingCartIcon,
  ArrowLeftIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OptimizedImage from "@/app/shop/components/OptimizedImage";

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, isLoading: productsLoading } = useProducts();
  const {
    cart,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCartWithProducts,
    findProductInCart,
  } = useCart();
  const [isClearing, setIsClearing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Confirmation modal states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showClearAllConfirmation, setShowClearAllConfirmation] =
    useState(false);

  // State to show checkout warning after clicking checkout
  const [showCheckoutWarning, setShowCheckoutWarning] = useState(false);

  useEffect(() => {
    const syncData = () => {
      if (!productsLoading && products.length > 0 && cart.length > 0) {
        const productData = products.map((p) => ({
          id: p.id,
          inStock: p.inStock,
          price: p.price,
          originalPrice: p.originalPrice,
          name: p.name,
          images: p.images,
          description: p.description,
          features: p.features,
          rating: p.rating,
          category: p.category,
        }));
        syncCartWithProducts(productData);
      }
    };

    // Immediate sync on component mount/update
    syncData();

    // Listen for tab switching and mobile "Back" button navigation
    window.addEventListener("visibilitychange", syncData);
    window.addEventListener("pageshow", syncData);

    return () => {
      window.removeEventListener("visibilitychange", syncData);
      window.removeEventListener("pageshow", syncData);
    };
  }, [products, productsLoading, cart.length, syncCartWithProducts]);

  // Format price as Naira with thousand separators
  const formatPrice = (price: number) => {
    if (price % 1 === 0) {
      return `₦${price.toLocaleString("en-US")}`;
    }
    const formattedAmount = price
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `₦${formattedAmount}`;
  };

  // Format price with 2 decimal places for Paystack
  const formatPriceWithDecimals = (price: number) => {
    return `NGN ${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice: number, price: number) => {
    if (!originalPrice) return 0;
    const discount = ((originalPrice - price) / originalPrice) * 100;
    return Math.round(discount);
  };

  // Handle individual item deletion
  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      removeFromCart(productToDelete);
      setShowDeleteConfirmation(false);
      setProductToDelete(null);
      if (!hasOutOfStockItems) {
        setShowCheckoutWarning(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setProductToDelete(null);
  };

  // Handle clear all items
  const handleClearAllClick = () => {
    setShowClearAllConfirmation(true);
  };

  const handleConfirmClearAll = () => {
    setIsClearing(true);
    clearCart();
    setShowClearAllConfirmation(false);
    setShowCheckoutWarning(false);
    setTimeout(() => setIsClearing(false), 1000);
  };

  const handleCancelClearAll = () => {
    setShowClearAllConfirmation(false);
  };

  // Handle opening product modal
  const handleOpenProduct = (cartItem: any) => {
    if (cartItem.inStock) {
      const actualProduct = products.find((p) => {
        const productIdStr = p.id.toString();
        const cartItemBaseId = cartItem.id.split("-")[0];
        return productIdStr === cartItemBaseId || productIdStr === cartItem.id;
      });

      if (actualProduct) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("product", actualProduct.id.toString());
        router.push(`/cart?${params.toString()}`, { scroll: false });
        setSelectedProduct(actualProduct);
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.set("product", cartItem.id);
        router.push(`/cart?${params.toString()}`, { scroll: false });
        setSelectedProduct(cartItem);
      }
    }
  };

  // Handle closing product modal
  const handleCloseProduct = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("product");
    router.replace(`/cart?${params.toString()}`, { scroll: false });
    setSelectedProduct(null);
  };

  // Initialize from URL
  useEffect(() => {
    const productId = searchParams.get("product");
    if (productId) {
      const actualProduct = products.find((p) => p.id.toString() === productId);
      if (actualProduct && actualProduct.inStock) {
        setSelectedProduct(actualProduct);
      } else {
        const cartItem = cart.find((item) => item.id === productId);
        if (cartItem && cartItem.inStock) {
          setSelectedProduct(cartItem);
        } else {
          setSelectedProduct(null);
        }
      }
    } else {
      setSelectedProduct(null);
    }
  }, [searchParams, cart, products]);

  // Listen for browser back button
  useEffect(() => {
    const handlePopState = () => {
      const productId = searchParams.get("product");
      if (!productId && selectedProduct) {
        setSelectedProduct(null);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [selectedProduct, searchParams]);

  // Hide scroll when modal is open
  useEffect(() => {
    if (selectedProduct || showDeleteConfirmation || showClearAllConfirmation) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, [selectedProduct, showDeleteConfirmation, showClearAllConfirmation]);

  // Handle quantity update with stock check
  const handleUpdateQuantity = (item: any, newQuantity: number) => {
    if (item.inStock && newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    }
  };

  // Handle increasing quantity with stock check
  const handleIncreaseQuantity = (item: any) => {
    if (item.inStock) {
      handleUpdateQuantity(item, item.quantity + 1);
    }
  };

  // Handle decreasing quantity
  const handleDecreaseQuantity = (item: any) => {
    if (item.quantity > 1) {
      handleUpdateQuantity(item, item.quantity - 1);
    } else if (item.quantity === 1) {
      handleDeleteClick(item.id);
    }
  };

  // Check if cart has out of stock items
  const hasOutOfStockItems = cart.some((item) => !item.inStock);

  // 🔥 CORRECT: Handle cart checkout with MULTIPLE items
  const handleCheckoutClick = () => {
    if (hasOutOfStockItems) {
      setShowCheckoutWarning(true);
      return;
    }

    const inStockItems = cart.filter((item) => item.inStock);

    if (inStockItems.length === 0) {
      alert("Your cart has no items in stock.");
      return;
    }

    // Calculate cart totals
    const subtotal = inStockItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const shippingFee = 2500;
    const total = subtotal + shippingFee;

    // Prepare cart data with ALL items
    const cartData = {
      items: inStockItems.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.images?.[0] || "",
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        selectedLength: item.selectedLength || "",
        selectedDensity: item.selectedDensity || "",
        selectedLaceSize: item.selectedLaceSize || "",
      })),
      subtotal,
      shippingFee,
      total,
      itemCount: inStockItems.length,
    };

    // 🔥 FULL PAGE REDIRECT to dedicated cart checkout page
    const params = new URLSearchParams({
      cartData: JSON.stringify(cartData),
    });

    window.location.href = `/checkout/cart-checkout?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Screen Modal for Product Details */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={handleCloseProduct}
          cartItemCount={cartCount}
          isInCart={true}
          cartQuantity={selectedProduct.quantity}
          onUpdateCart={(product, newQuantity) => {
            const cartItem = findProductInCart(product.id);
            if (cartItem && product.inStock) {
              updateQuantity(cartItem.id, newQuantity);
              setSelectedProduct({ ...selectedProduct, quantity: newQuantity });
            }
          }}
          onRemoveFromCart={(productId) => {
            const cartItem = findProductInCart(productId);
            if (cartItem) {
              removeFromCart(cartItem.id);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Remove Item</h3>
                <p className="text-gray-500 text-sm">
                  Are you sure you want to remove this item from your cart?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-start mr-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Clear Cart</h3>
                <p className="text-gray-500 text-sm">
                  Are you sure you want to remove all items ({cartCount}) from
                  your cart?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCancelClearAll}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Logo on the left */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center">
            <div className="pt-1">
              <div className="flex flex-col items-start">
                <span className="font-abyssinica text-xl md:text-2xl text-black font-bold leading-none mb-0.5">
                  HAIR
                </span>
                <span className="font-akronim text-2xl md:text-4xl text-black font-bold -ml-1 leading-none">
                  Universe
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - REMOVED BOTTOM PADDING */}
      <main className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-80px)] bg-gray-200">
        {cart.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-12 md:py-20">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
              <ShoppingCartIcon className="w-20 h-20 md:w-24 md:h-24 text-gray-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-3 md:mb-4">
              Your cart is empty!
            </h2>
            <p className="text-gray-500 mb-8 md:mb-10 max-w-md mx-auto">
              Browse our categories and discover our best deals!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center bg-pink-500 text-white px-12 md:px-18 py-3 md:py-4 rounded-sm font-medium hover:bg-pink-600 transition duration-200"
            >
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {/* Cart Summary Container */}
            <div className="mb-1 lg:mb-8">
              <div className="flex flex-col space-y-1">
                {/* Cart Summary Title */}
                <div className="ml-3">
                  <h2 className="text-sm font-medium text-gray-500">
                    Cart Summary
                  </h2>
                </div>

                {/* Subtotal with full width white background */}
                <div className="bg-white shadow-sm p-1">
                  <div className="flex justify-between items-center ml-2">
                    <span className="text-gray-800 font-semibold">
                      Subtotal
                    </span>
                    <span className="font-sans text-base font-semibold text-gray-900 mr-2.5">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>

                {/* Cart item count */}
                <div className="ml-3">
                  <span className="text-gray-500 text-sm">
                    Cart ({cartCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Cart Products - This will grow/shrink based on content */}
            <div className="flex-1">
              {/* Cart Items List */}
              <div className="-mx-4 md:mx-0 bg-gray-200 md:rounded-xl shadow-sm py-1 px-3 md:p-6 mb-6">
                <div className="space-y-2 md:space-y-6">
                  {cart.map((item) => {
                    const discountPercentage = item.originalPrice
                      ? getDiscountPercentage(item.originalPrice, item.price)
                      : 0;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start pb-4 md:pb-6 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${
                          !item.inStock ? "opacity-80 relative" : ""
                        }`}
                      >
                        {/* Left Column - Image and Delete Button */}
                        <div className="w-28 md:w-32 flex-shrink-0 mr-2 relative">
                          {/* Product Image - Clickable only if in stock */}
                          <div
                            className={`w-30 h-30 md:w-36 md:h-36 rounded-lg overflow-hidden relative bg-white mb-3 group ${
                              item.inStock ? "cursor-pointer" : "cursor-default"
                            }`}
                            onClick={() =>
                              item.inStock && handleOpenProduct(item)
                            }
                          >
                            {item.images && item.images.length > 0 ? (
                              <OptimizedImage
                                src={item.images[0]}
                                alt={item.name}
                                thumbnail={true}
                                priority={true}
                                width={200}
                                quality={70}
                                className={`p-2 transition-transform duration-200 ${
                                  item.inStock
                                    ? "group-hover:scale-105"
                                    : "filter grayscale blur-[0.4px]"
                                }`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCartIcon className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                              </div>
                            )}

                            {/* Discount Badge on Image */}
                            {item.originalPrice &&
                              discountPercentage > 0 &&
                              item.inStock && (
                                <div className="absolute top-2 right-2 z-20">
                                  <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                    -{discountPercentage}%
                                  </span>
                                </div>
                              )}

                            {/* Out of Stock Badge */}
                            {!item.inStock && (
                              <div className="absolute top-2 right-1 z-20">
                                <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                  Sold Out
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Delete Button under image - Now opens confirmation */}
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="flex items-center text-pink-500 hover:text-red-600 transition text-sm mt-1"
                          >
                            <TrashIcon className="w-5 h-5 mr-1" />
                            <span>Remove</span>
                          </button>
                        </div>

                        {/* Middle Column - Product Details */}
                        <div className="flex-1 min-w-0 mt-2.5 md:mt-4 mr-2 lg:ml-6">
                          {/* Product Info with truncation */}
                          <div className="mb-2">
                            <h3
                              className={`font-medium text-sm md:text-base mb-1 line-clamp-2 truncate ${
                                !item.inStock
                                  ? "text-gray-500"
                                  : "text-gray-800"
                              }`}
                              title={item.name}
                            >
                              {item.name}
                            </h3>

                            {/* Price Display with Discount */}
                            {item.originalPrice &&
                            item.originalPrice > item.price ? (
                              <div className="flex flex-col gap-0.5 ">
                                {/* Current Price - TOP */}
                                <span
                                  className={`font-semibold text-base md:text-lg ${
                                    !item.inStock
                                      ? "text-gray-400"
                                      : "text-black"
                                  }`}
                                >
                                  {formatPrice(item.price)}
                                </span>

                                {/* Original Price - BELOW with slash */}
                                <span className="text-gray-500 text-sm line-through">
                                  {formatPrice(item.originalPrice)}
                                </span>
                              </div>
                            ) : (
                              /* Regular Price (no discount) */
                              <span
                                className={`font-semibold text-base md:text-lg ${
                                  !item.inStock ? "text-gray-400" : "text-black"
                                }`}
                              >
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls - Disabled when out of stock */}
                        <div className="self-end shrink md:shrink-0">
                          {item.inStock ? (
                            <div className="flex items-center">
                              <button
                                onClick={() => handleDecreaseQuantity(item)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-200 rounded-l-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="w-10 h-8 flex items-center justify-center bg-white text-gray-800 font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleIncreaseQuantity(item)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-200 rounded-r-lg transition"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-end">
                              <p className="text-xs text-gray-700 mt-1 text-right font-bold mr-2">
                                Out of Stock
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="bg-white shadow-sm p-3 mb-6">
                <h3 className="text-sm font-medium text-gray-800 ml-0.5 mb-2">
                  Need more items?
                </h3>
                <Link
                  href="/shop"
                  className="inline-flex items-center border-2 border-pink-500 text-pink-600 px-3 py-1.5 rounded-sm text-xs hover:bg-pink-50 transition"
                >
                  <ArrowLeftIcon className="w-3 h-3 mr-1.5" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Checkout Section - Always at the bottom of the content */}
            <div className="mt-auto">
              {/* Show warning message only after clicking checkout and there are out of stock items */}
              {showCheckoutWarning && hasOutOfStockItems && (
                <div className="mb-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="ml-2">
                        <h3 className="text-sm font-medium text-red-700">
                          Some items are out of stock
                        </h3>
                        <div className="mt-1 text-sm text-red-600">
                          <p>
                            Remove out-of-stock items to proceed with checkout
                          </p>
                          <p className="mt-1 text-xs">
                            Items marked as &apos;Out of Stock&apos; cannot be
                            purchased
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Checkout and Clear Cart Container */}
              <div className="bg-white p-4 md:p-6 shadow-lg">
                {/* Checkout Button - NOW WITH FULL PAGE REDIRECT */}
                <div className="flex justify-center mb-3">
                  <button
                    onClick={handleCheckoutClick}
                    className={`py-4 px-5 rounded-lg font-bold transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center min-w-[280px] ${
                      showCheckoutWarning && hasOutOfStockItems
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    }`}
                  >
                    <span>Checkout</span>
                    <span className="font-bold text-sm ml-2">
                      {formatPrice(cartTotal)}
                    </span>
                  </button>
                </div>

                {/* Clear Cart Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleClearAllClick}
                    disabled={isClearing}
                    className="py-4 px-8 rounded-lg font-medium transition duration-200 shadow-sm hover:shadow-lg flex items-center justify-center min-w-[280px] text-gray-800 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    {isClearing ? "Clearing..." : "Clear cart"}
                  </button>
                </div>
              </div>

              {/* Footer Note - Now outside the padded container for full width */}
              <div className="w-full">
                <div className="bg-blue-50 pl-2 pt-2 pb-4 w-full">
                  <div className="text-left w-full">
                    <p className="text-black text-sm w-full">
                      Your cart is saved automatically. You can come back
                      anytime to complete your purchase.
                      {hasOutOfStockItems && !showCheckoutWarning && (
                        <span className="block mt-1 text-gray-600">
                          ⚠️ Some items are out of stock
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
