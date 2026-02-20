// app/context/CartContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  quantity: number;
  features?: string[];
  description?: string;
  rating?: number;
  inStock?: boolean;
  category?: string;
  lastUpdated?: number;
  selectedLength?: string;
  selectedDensity?: string;
  selectedLaceSize?: string;
  hairInfo?: string;
  dealLeftText?: string;
  dealLeftIcon?: string;
  dealLeftTag?: string;
  dealRightText?: string;
  dealRightIcon?: string;
  dealRightTag?: string;
  taxNotice?: string;
  laceLabel?: string;
  shippingFee?: number;
  deliveryText?: string;
}

interface ProductData {
  id: string | number;
  inStock: boolean;
  price?: number;
  originalPrice?: number;
  name?: string;
  images?: string[];
  description?: string;
  features?: string[];
  rating?: number;
  category?: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
  updateProductStockStatus: (productData: ProductData[]) => void;
  findProductInCart: (productId: string | number) => CartItem | undefined;
  syncCartWithProducts: (products: ProductData[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "hair_universe_cart";

const getBaseId = (id: string): string => id.split("-")[0];

const getInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      features: item.features || [],
      description: item.description || "",
      rating: item.rating || 0,
      inStock: item.inStock !== undefined ? item.inStock : true,
      category: item.category || "",
      selectedLength: item.selectedLength || "",
      selectedDensity: item.selectedDensity || "",
      selectedLaceSize: item.selectedLaceSize || "",
      hairInfo: item.hairInfo || "",
      dealLeftText: item.dealLeftText || "",
      dealLeftIcon: item.dealLeftIcon || "",
      dealLeftTag: item.dealLeftTag || "",
      dealRightText: item.dealRightText || "",
      dealRightIcon: item.dealRightIcon || "",
      dealRightTag: item.dealRightTag || "",
      taxNotice: item.taxNotice || "",
      lastUpdated: item.lastUpdated || Date.now(),
    }));
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    const cartData = getInitialCart();
    setCart(cartData);
    setIsInitialized(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoading, isInitialized]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const findProductInCart = useCallback(
    (productId: string | number): CartItem | undefined => {
      const productIdStr = productId.toString();
      const exactMatch = cart.find((item) => item.id === productIdStr);
      if (exactMatch) return exactMatch;
      return cart.find((item) => getBaseId(item.id) === productIdStr);
    },
    [cart],
  );

  const showToast = useCallback((message: string, options?: any) => {
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    toastIdRef.current = toast.success(message, {
      position: "top-center",
      duration: 2000,
      style: { marginTop: "10vh" },
      ...options,
    });
  }, []);

  const syncCartWithProducts = useCallback(
    (products: ProductData[]) => {
      if (!isInitialized || !products || products.length === 0) return;

      setCart((prev) => {
        if (prev.length === 0) return prev;
        let hasMadeChanges = false;

        const newCart = prev.map((cartItem) => {
          const cartBaseId = cartItem.id.toString().split("-")[0];
          const matchingProduct = products.find((p) => {
            const pId = p.id.toString();
            return pId === cartBaseId || pId === cartItem.id.toString();
          });

          if (matchingProduct) {
            const isNowOutOfStock =
              cartItem.inStock && !matchingProduct.inStock;
            const isNowInStock = !cartItem.inStock && matchingProduct.inStock;
            const priceChanged = cartItem.price !== matchingProduct.price;

            if (isNowOutOfStock || isNowInStock || priceChanged) {
              hasMadeChanges = true;
              return {
                ...cartItem,
                inStock: matchingProduct.inStock,
                price: matchingProduct.price ?? cartItem.price,
                lastUpdated: Date.now(),
              };
            }
          } else {
            hasMadeChanges = true;
            return { ...cartItem, inStock: false, lastUpdated: Date.now() };
          }
          return cartItem;
        });

        return hasMadeChanges ? newCart : prev;
      });
    },
    [isInitialized],
  );

  // FIX: Realtime listener directly in CartContext so cart updates
  // instantly when admin changes stock — works on ALL pages, not just shop
  useEffect(() => {
    if (!isInitialized) return;

    const channel = supabase
      .channel("cart-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          if (!payload.new) return;
          const updated = payload.new as any;

          // Convert Supabase UUID to the numeric ID format used in cart
          const numericId =
            parseInt(updated.id?.replace(/\D/g, "").slice(0, 9)) || 0;

          // Parse images safely
          let images: string[] = [];
          try {
            images = Array.isArray(updated.images)
              ? updated.images
              : JSON.parse(updated.images || "[]");
          } catch {
            images = [];
          }

          syncCartWithProducts([
            {
              id: numericId,
              inStock: updated.in_stock === 1,
              price: updated.price || 0,
              originalPrice: updated.original_price,
              name: updated.name,
              images,
            },
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isInitialized, syncCartWithProducts]);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      if (!isInitialized) return;
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          const newQuantity = existing.quantity + 1;
          setTimeout(() => {
            showToast(`Cart updated! (${newQuantity} in cart)`, {
              icon: "🛒",
              duration: 2000,
            });
          }, 0);
          return prev.map((i) =>
            i.id === item.id
              ? { ...i, quantity: newQuantity, lastUpdated: Date.now() }
              : i,
          );
        }
        setTimeout(() => {
          showToast("Added to cart! 🛒", { duration: 3000 });
        }, 0);
        return [
          ...prev,
          {
            ...item,
            quantity: 1,
            features: item.features || [],
            description: item.description || "",
            rating: item.rating || 0,
            inStock: item.inStock !== undefined ? item.inStock : true,
            category: item.category || "",
            selectedLength: item.selectedLength || "",
            selectedDensity: item.selectedDensity || "",
            selectedLaceSize: item.selectedLaceSize || "",
            hairInfo: item.hairInfo || "",
            dealLeftText: item.dealLeftText || "",
            dealLeftIcon: item.dealLeftIcon || "",
            dealLeftTag: item.dealLeftTag || "",
            dealRightText: item.dealRightText || "",
            dealRightIcon: item.dealRightIcon || "",
            dealRightTag: item.dealRightTag || "",
            taxNotice: item.taxNotice || "",
            laceLabel: item.laceLabel || "",
            shippingFee: item.shippingFee || 2500,
            deliveryText: item.deliveryText || "Jan. 22 - Feb. 04",
            lastUpdated: Date.now(),
          },
        ];
      });
    },
    [isInitialized, showToast],
  );

  const removeFromCart = useCallback(
    (id: string) => {
      if (!isInitialized) return;
      const item = cart.find((i) => i.id === id);
      setTimeout(() => {
        showToast(
          `${item?.name ? `"${item.name}"` : "Item"} removed from cart`,
          { icon: "🗑️", duration: 2000 },
        );
      }, 0);
      setCart((prev) => prev.filter((i) => i.id !== id));
    },
    [cart, isInitialized, showToast],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (!isInitialized) return;
      const item = cart.find((i) => i.id === id);
      if (item && item.quantity !== quantity) {
        const action = quantity > item.quantity ? "increased" : "decreased";
        setTimeout(() => {
          showToast(`Quantity ${action} to ${quantity}`, { duration: 1500 });
        }, 0);
      }
      setCart(
        (prev) =>
          prev
            .map((i) => {
              if (i.id !== id) return i;
              if (i.inStock === false) return i;
              if (quantity < 1) return null;
              return { ...i, quantity, lastUpdated: Date.now() };
            })
            .filter(Boolean) as CartItem[],
      );
    },
    [cart, isInitialized, showToast],
  );

  const clearCart = useCallback(() => {
    if (!isInitialized) return;
    setTimeout(() => {
      showToast("Cart cleared", { duration: 2000 });
    }, 0);
    setCart([]);
  }, [isInitialized, showToast]);

  const updateProductStockStatus = useCallback(
    (productData: ProductData[]) => {
      syncCartWithProducts(productData);
    },
    [syncCartWithProducts],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading: !isInitialized,
        updateProductStockStatus,
        findProductInCart,
        syncCartWithProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
      cart: [],
      cartCount: 0,
      cartTotal: 0,
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      isLoading: true,
      updateProductStockStatus: () => {},
      findProductInCart: () => undefined,
      syncCartWithProducts: () => {},
    };
  }
  return context;
}
