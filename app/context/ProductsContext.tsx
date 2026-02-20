// app/context/ProductsContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { fetchProducts } from "@/lib/shop-fetch";
import { supabase } from "@/lib/supabase";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  features: string[];
  rating: number;
  inStock: boolean;
  category: string;
  lastUpdated: number;
  hairInfo?: string;
  selectedLength?: string;
  selectedDensity?: string;
  selectedLaceSize?: string;
  dealLeftText?: string;
  dealLeftIcon?: string;
  dealLeftTag?: string;
  dealRightText?: string;
  dealRightIcon?: string;
  dealRightTag?: string;
  taxNotice?: string;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined,
);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // FIX: Supabase realtime subscription — updates products instantly
  // when admin changes stock status, price, or anything else
  useEffect(() => {
    const channel = supabase
      .channel("products-context-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          // Refetch all products on any change
          loadProducts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadProducts]);

  // Auto-refresh every 60 seconds as backup
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!loading && document.visibilityState === "visible") {
        loadProducts();
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [loading, loadProducts]);

  // Refresh when tab becomes visible or page is shown (mobile back button)
  useEffect(() => {
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        loadProducts();
      }
    };

    const handlePageShow = () => loadProducts();

    document.addEventListener("visibilitychange", handleSync);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [loadProducts]);

  // Listen for manual refresh events from admin
  useEffect(() => {
    const handleRefreshEvent = () => {
      if (!loading) loadProducts();
    };

    window.addEventListener("refresh-products", handleRefreshEvent);
    return () =>
      window.removeEventListener("refresh-products", handleRefreshEvent);
  }, [loadProducts, loading]);

  const refreshProducts = async () => {
    await loadProducts();
  };

  return (
    <ProductsContext.Provider value={{ products, loading, refreshProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within ProductsProvider");
  }
  return context;
}
