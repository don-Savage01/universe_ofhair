// app/shop/components/HeroSection.tsx
"use client";

import { HeroSectionProps } from "./types";
import { useState, useRef, useEffect } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  clearSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  filteredProducts,
}: HeroSectionProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { cartCount } = useCart();

  // Handle back button press when search is focused OR has text
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      if (isSearchFocused || searchQuery) {
        // Prevent default back navigation
        e.preventDefault();

        // If search has text, clear it first
        if (searchQuery) {
          clearSearch();
        }

        // If search is focused, blur it
        if (isSearchFocused && searchInputRef.current) {
          searchInputRef.current.blur();
          setIsSearchFocused(false);
        }

        // Push a new state to prevent browser back navigation
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isSearchFocused, searchQuery, clearSearch]);

  // Add history state when search gets focus or has text
  useEffect(() => {
    if (isSearchFocused || searchQuery) {
      window.history.pushState(null, "", window.location.href);
    }
  }, [isSearchFocused, searchQuery]);

  // Simple focus handler
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const handleSearchBlur = () => {
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSearch();
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    router.push("/cart");
  };

  // Handle escape key to blur search and clear if needed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (searchQuery) {
          clearSearch();
        }
        if (isSearchFocused && searchInputRef.current) {
          searchInputRef.current.blur();
          setIsSearchFocused(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchFocused, searchQuery, clearSearch]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Search Bar with Cart Icon */}
      <div className="mb-6 -mt-2.5 flex items-center gap-2 relative">
        {/* Search container */}
        <div
          className={`transition-all duration-300 flex flex-col relative z-50 ${
            isSearchFocused
              ? "w-[80%] md:w-[40%]"
              : searchQuery
              ? "w-[70%] md:w-[40%]"
              : "w-[70%] md:w-1/3"
          }`}
        >
          <div className="relative">
            {/* Search Icon */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-50">
              <svg
                className={`h-5 w-5 ${
                  searchQuery ? "text-pink-500" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search on Hair Universe"
              className="relative w-full pl-7 pr-10 py-1.5 text-sm border-2 border-gray-300 rounded-md bg-white
                       focus:outline-none focus:ring-1 focus:ring-pink-400 focus:border-transparent
                       pointer-events-auto"
            />

            {/* Clear button */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto"
                aria-label="Clear search"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
            )}
          </div>

          {/* Results */}
          {searchQuery && (
            <p className="mt-3 text-gray-600 pointer-events-none">
              Found{" "}
              <span className="font-semibold text-pink-600">
                {filteredProducts.length}
              </span>{" "}
              results for &quot;{searchQuery}&quot;
            </p>
          )}
        </div>

        {/* Cart Icon - HIDDEN when search is focused OR has text */}
        {!isSearchFocused && !searchQuery && (
          <button
            onClick={handleCartClick}
            className={`flex-shrink-0 transition-opacity duration-300 relative z-50 ${
              isSearchFocused && searchQuery ? "opacity-100" : "opacity-100"
            }`}
          >
            <div className="relative p-3 rounded-lg hover:bg-gray-200 transition-colors">
              {/* Shopping Cart Icon */}
              <ShoppingCartIcon className="w-6.5 h-6.5 text-gray-700" />

              {/* Cart Badge */}
              {cartCount > 0 && (
                <div className="absolute top-1 right-0.5 bottom-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center pointer-events-none">
                  {cartCount}
                </div>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category: string) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 px-5 py-3 rounded-lg transition whitespace-nowrap pointer-events-auto ${
                selectedCategory === category
                  ? "bg-pink-500 text-white shadow-md"
                  : "bg-white shadow-sm hover:shadow-xl text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
