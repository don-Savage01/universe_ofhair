"use client";
import { useProductUpdates } from "./hooks/useProductUpdates";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import HeroSection from "./components/HeroSection";
import ProductGrid from "./components/ProductGrid";
import ShopFooter from "./components/ShopFooter";
import ProductModal from "./components/ProductModal";
import { Product, transformSupabaseProduct } from "./components/types";
import { fetchProducts, fetchUniqueCategories } from "@/lib/shop-fetch";

/* -------------------- SHOP PAGE -------------------- */
export default function ShopPage() {
  const { addToCart, updateProductStockStatus } = useCart();

  // STATE FOR PRODUCTS FROM SUPABASE
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  /* -------------------- FETCH PRODUCTS FUNCTION -------------------- */
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Helper function to properly format category names
  const formatCategoryName = useCallback((category: string): string => {
    if (!category) return "";

    return category
      .split(" ")
      .map((word) => {
        if (word === "&") return "&";
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }, []);

  /* -------------------- FETCH CATEGORIES FUNCTION -------------------- */
  const loadCategories = useCallback(async () => {
    try {
      const uniqueCategories = await fetchUniqueCategories();

      const formattedCategories = uniqueCategories.map(formatCategoryName);

      setCategories(["All", ...formattedCategories]);
    } catch (error) {
      setCategories([
        "All",
        "Wigs",
        "Beauty & Cosmetics",
        "Skincare",
        "Hair & Wigs",
        "Jewelry & Accessories",
        "Fashion & Clothing",
        "Gadgets",
        "Appliances",
        "Hair & Beauty Tools",
        "Personal Care",
        "Bags & Luggage",
      ]);
    }
  }, [formatCategoryName]);

  /* -------------------- INITIAL FETCH -------------------- */
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadProducts(), loadCategories()]);
      } catch (error) {
        // Silently handle error
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [loadProducts, loadCategories]);

  /* -------------------- REALTIME UPDATES -------------------- */
  useProductUpdates((productData) => {
    // ALWAYS refresh products when any change happens
    loadProducts();
  });

  /* -------------------- SYNC CART WITH PRODUCTS -------------------- */
  useEffect(() => {
    if (products.length === 0) return;

    updateProductStockStatus(
      products.map((p) => ({
        id: p.id,
        inStock: p.inStock,
        price: p.price,
        originalPrice: p.originalPrice,
        name: p.name,
      })),
    );
  }, [products, updateProductStockStatus]);

  /* -------------------- FILTERS -------------------- */
  const filteredBySearch = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.features.some((feature) =>
          feature.toLowerCase().includes(query),
        ),
    );
  }, [products, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return filteredBySearch;

    return filteredBySearch.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }, [selectedCategory, filteredBySearch]);

  /* -------------------- PRODUCT MODAL -------------------- */
  const openProductDetails = (product: Product) => setSelectedProduct(product);

  /* -------------------- ADD TO CART -------------------- */
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      images: product.images,
      inStock: product.inStock,
    });
  };

  /* -------------------- SEARCH -------------------- */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);
  const clearSearch = () => setSearchQuery("");

  /* -------------------- LOADING STATE -------------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading product details...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait…</p>
        </div>
      </div>
    );
  }

  /* -------------------- NO PRODUCTS STATE -------------------- */
  if (!isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-50 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-10 h-10 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Connection Problem
          </h1>

          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            We're having trouble loading products. This usually happens when
            your internet connection is slow or unstable.
          </p>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-start text-left">
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Try These Steps:
                </h3>
                <ol className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      1
                    </span>
                    <span>Check your internet connection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      2
                    </span>
                    <span>Try switching between WiFi and mobile data</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      3
                    </span>
                    <span>Refresh the page or try again in a moment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      4
                    </span>
                    <span>If the problem persists, contact support</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200 border border-gray-300 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Tip:</span> You can also check if
              other websites are loading to confirm if it's your connection.
            </p>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Still having issues? Contact us via WhatsApp or email
          </p>
        </div>
      </div>
    );
  }

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="w-full px-4 py-8 flex-1">
        <div className="w-full max-w-screen-2xl mx-auto">
          <HeroSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
            clearSearch={clearSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            filteredProducts={filteredProducts}
          />

          <ProductGrid
            filteredProducts={filteredProducts}
            openProductDetails={openProductDetails}
            handleAddToCart={handleAddToCart}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            products={products}
          />
        </div>
      </main>

      <ShopFooter />

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={() => {
            handleAddToCart(selectedProduct);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* CSS */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
