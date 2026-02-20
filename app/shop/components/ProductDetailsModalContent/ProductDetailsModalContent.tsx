"use client";

import { Product } from "../types";
import { useCart } from "@/app/context/CartContext";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProductInfoSection from "./ProductInfoSection";
import OptionSelectors from "./OptionSelectors";
import ServiceCommitment from "./ServiceCommitment";
import ActionButtons from "./ActionButtons";
import RemoveConfirmModal from "./RemoveConfirmModal";

interface ProductDetailsModalContentProps {
  product: Product;
  onClose: () => void;
  onShowDeliveryModal: () => void;
  onShowRefundModal: () => void;
  onShowPrivacyModal: () => void;
  isInCart?: boolean;
}

interface LengthOption {
  value: string;
  label?: string;
  price: number;
  originalPrice?: number;
  laceSize?: string;
}

interface LaceSizeOption {
  value: string;
  label: string;
  priceMultiplier: number;
}

export default function ProductDetailsModalContent({
  product,
  onClose,
  onShowDeliveryModal,
  onShowRefundModal,
  onShowPrivacyModal,
  isInCart = false,
}: ProductDetailsModalContentProps) {
  const { addToCart, updateQuantity, removeFromCart, findProductInCart } =
    useCart();
  const router = useRouter();
  const [isHairInfoExpanded, setIsHairInfoExpanded] = useState(false);
  const [selectedLength, setSelectedLength] = useState<string>("");
  const [selectedDensity, setSelectedDensity] = useState<string>("");
  const [selectedLaceSize, setSelectedLaceSize] = useState<string>("");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [cartItemId, setCartItemId] = useState<string>("");
  const [cartItemQuantity, setCartItemQuantity] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);

  const hasLengthOptions = useMemo(() => {
    return product.lengthOptions && product.lengthOptions.length > 0;
  }, [product.lengthOptions]);

  const hasLaceSizeOptions = useMemo(() => {
    return product.laceSizeOptions && product.laceSizeOptions.length > 0;
  }, [product.laceSizeOptions]);

  const hasDensityOptions = useMemo(() => {
    if (!product.densityOptions || !Array.isArray(product.densityOptions)) {
      return false;
    }
    const validOptions = product.densityOptions
      .map((opt) => {
        if (opt && typeof opt === "object" && "value" in opt) {
          return opt.value;
        }
        return opt;
      })
      .filter((opt) => opt && typeof opt === "string" && opt.trim() !== "");
    return validOptions.length > 0;
  }, [product.densityOptions]);

  const laceLabel = useMemo(() => {
    if (!hasLaceSizeOptions) return "";
    return product.laceLabel || "Lace size";
  }, [product.laceLabel, hasLaceSizeOptions]);

  const lengthOptions = useMemo(
    (): LengthOption[] =>
      product.lengthOptions && product.lengthOptions.length > 0
        ? product.lengthOptions
        : [],
    [product.lengthOptions],
  );

  const laceSizeOptions = useMemo((): LaceSizeOption[] => {
    if (!product.laceSizeOptions || product.laceSizeOptions.length === 0) {
      return [];
    }
    return product.laceSizeOptions.map((option: any) => {
      // Handle priceMultiplier safely
      let priceMultiplier = 0;

      if (typeof option.priceMultiplier === "string") {
        // Remove commas and parse as float
        priceMultiplier =
          parseFloat(option.priceMultiplier.replace(/,/g, "")) || 0;
      } else if (typeof option.priceMultiplier === "number") {
        priceMultiplier = option.priceMultiplier;
      } else if (option.priceMultiplier) {
        // Try to convert to number if it's something else
        priceMultiplier = Number(option.priceMultiplier) || 0;
      }

      return {
        value: option.value,
        label: option.label || option.value,
        priceMultiplier: priceMultiplier,
      };
    });
  }, [product.laceSizeOptions]);

  const densityOptions = useMemo(() => {
    if (!product.densityOptions || !Array.isArray(product.densityOptions)) {
      return [];
    }
    return product.densityOptions
      .map((opt: any) => {
        // Change this line to use `any`
        if (opt && typeof opt === "object" && "value" in opt) {
          // Handle additionalPrice safely
          let additionalPrice = 0;

          if (typeof opt.additionalPrice === "string") {
            additionalPrice =
              parseFloat(opt.additionalPrice.replace(/,/g, "")) || 0;
          } else if (typeof opt.additionalPrice === "number") {
            additionalPrice = opt.additionalPrice;
          } else if (opt.additionalPrice) {
            additionalPrice = Number(opt.additionalPrice) || 0;
          }

          return {
            value: opt.value,
            label: opt.label || opt.value,
            additionalPrice: additionalPrice,
            prices: opt.prices || [],
          };
        }
        if (typeof opt === "string" && opt.trim() !== "") {
          return {
            value: opt,
            label: opt,
            additionalPrice: 0,
            prices: [],
          };
        }
        return null;
      })
      .filter(
        (
          opt,
        ): opt is {
          value: string;
          label: string;
          additionalPrice: number;
          prices: any[];
        } => opt !== null && opt.value && opt.value.trim() !== "",
      );
  }, [product.densityOptions]);

  const formatPriceWithDecimals = (price: number) => {
    return `NGN ${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getCleanProductName = useCallback(() => {
    if (isInCart && cartItemId) {
      const cartItem = findProductInCart(product.id);
      if (cartItem) {
        const name = cartItem.name;
        const cleanName = name.split(
          / \(|\s\[| - 20| - 22| - 24| - 26| - 28| - 30| - 14| - 16| - 18/,
        )[0];
        return cleanName || product.name;
      }
    }
    return product.name;
  }, [isInCart, cartItemId, product.id, product.name, findProductInCart]);

  const getCurrentBasePrice = useCallback(() => {
    if (hasLengthOptions && selectedLength) {
      const option = lengthOptions.find((opt) => opt.value === selectedLength);
      return option?.price || product.price;
    }
    return product.price;
  }, [selectedLength, lengthOptions, product.price, hasLengthOptions]);

  const getCurrentBaseOriginalPrice = useCallback(() => {
    if (hasLengthOptions && selectedLength) {
      const option = lengthOptions.find((opt) => opt.value === selectedLength);
      return option?.originalPrice || product.originalPrice;
    }
    return product.originalPrice;
  }, [selectedLength, lengthOptions, product.originalPrice, hasLengthOptions]);

  const getLaceSizePrice = useCallback(() => {
    if (hasLaceSizeOptions && selectedLaceSize) {
      const selectedOption = laceSizeOptions.find(
        (opt) => opt.value === selectedLaceSize,
      );
      return selectedOption?.priceMultiplier || 0;
    }
    return 0;
  }, [selectedLaceSize, laceSizeOptions, hasLaceSizeOptions]);

  // ✅ FIXED: Returns the additional price for the selected density
  const getDensityPrice = useCallback(() => {
    if (
      !hasDensityOptions ||
      !selectedDensity ||
      selectedDensity.trim() === ""
    ) {
      return 0;
    }

    const selectedOption = densityOptions.find(
      (opt) => opt.value === selectedDensity,
    );
    if (!selectedOption) return 0;

    // If it's the first density (base), return 0 (no additional price)
    if (selectedOption.value === densityOptions[0]?.value) {
      return 0;
    }

    // If we have a price matrix and selected length
    if (
      selectedOption.prices &&
      selectedOption.prices.length > 0 &&
      selectedLength
    ) {
      const sel = selectedLength.toLowerCase();

      // Find the matching price entry
      const matchingPrice = selectedOption.prices.find((p: any) => {
        const id = (p.lengthId || "").toLowerCase();
        const val = (p.lengthValue || "").toLowerCase();
        return (
          id === sel ||
          val === sel ||
          id === `length-${sel}` ||
          id.endsWith(`-${sel}`) ||
          val === sel.replace("inches", "") ||
          id === sel.replace("inches", "")
        );
      });

      if (matchingPrice) {
        // Get the base price for this length
        const baseLengthPrice =
          lengthOptions.find((l) => l.value === selectedLength)?.price ||
          product.price;

        // Return the DIFFERENCE (additional price)
        return matchingPrice.price - baseLengthPrice;
      }
    }

    // Fallback to additionalPrice if no matrix match
    return selectedOption.additionalPrice || 0;
  }, [
    selectedDensity,
    selectedLength,
    hasDensityOptions,
    densityOptions,
    lengthOptions,
    product.price,
  ]);

  const getCurrentPrice = useCallback(() => {
    const basePrice = getCurrentBasePrice();
    const lacePrice = getLaceSizePrice();
    const densityPrice = getDensityPrice();
    return basePrice + lacePrice + densityPrice;
  }, [getCurrentBasePrice, getLaceSizePrice, getDensityPrice]);

  const getCurrentOriginalPrice = useCallback(() => {
    const baseOriginalPrice = getCurrentBaseOriginalPrice();
    if (!baseOriginalPrice) return undefined;
    const lacePrice = getLaceSizePrice();
    const densityPrice = getDensityPrice();
    return baseOriginalPrice + lacePrice + densityPrice;
  }, [getCurrentBaseOriginalPrice, getLaceSizePrice, getDensityPrice]);

  const getDiscountPercentage = (
    currentPrice: number,
    originalPrice?: number,
  ) => {
    if (!originalPrice) return 0;
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  const currentPrice = getCurrentPrice();
  const currentOriginalPrice = getCurrentOriginalPrice();
  const discountPercentage = getDiscountPercentage(
    currentPrice,
    currentOriginalPrice,
  );

  const isOutOfStock = product.inStock === false;

  useEffect(() => {
    if (!initialized) {
      const cartItem = findProductInCart(product.id);

      if (cartItem) {
        setCartItemId(cartItem.id);
        setCartItemQuantity(cartItem.quantity);

        if (cartItem.selectedLength) {
          setSelectedLength(cartItem.selectedLength);
        }

        if (cartItem.selectedLaceSize) {
          setSelectedLaceSize(cartItem.selectedLaceSize);
        } else if (hasLaceSizeOptions && laceSizeOptions.length > 0) {
          setSelectedLaceSize(laceSizeOptions[0].value);
        }

        if (cartItem.selectedDensity) {
          setSelectedDensity(cartItem.selectedDensity);
        }
      }

      if (hasLengthOptions && lengthOptions.length > 0 && !selectedLength) {
        setSelectedLength(lengthOptions[0].value);
      }

      if (
        hasLaceSizeOptions &&
        laceSizeOptions.length > 0 &&
        !selectedLaceSize
      ) {
        setSelectedLaceSize(laceSizeOptions[0].value);
      }

      if (hasDensityOptions && densityOptions.length > 0 && !selectedDensity) {
        setSelectedDensity(densityOptions[0].value);
      }

      setInitialized(true);
    }
  }, [
    isInCart,
    initialized,
    lengthOptions,
    laceSizeOptions,
    densityOptions,
    hasLengthOptions,
    hasLaceSizeOptions,
    hasDensityOptions,
    product.id,
    findProductInCart,
  ]);

  const handleAddToCartClick = (length?: string) => {
    if (!isOutOfStock) {
      const newCartItemId =
        hasLengthOptions && length
          ? product.id + `-${length}`
          : product.id.toString();

      addToCart({
        id: newCartItemId,
        name: `${product.name}${hasLengthOptions && length ? ` - ${length}` : ""}`,
        price: getCurrentPrice(),
        originalPrice: getCurrentOriginalPrice(),
        images: product.images,
        features: product.features || [],
        description: product.description || "",
        rating: product.rating || 0,
        inStock: product.inStock,
        category: product.category || "",
        hairInfo: product.hairInfo || "",
        dealLeftText: product.dealLeftText || "",
        dealLeftIcon: product.dealLeftIcon || "",
        dealLeftTag: product.dealLeftTag || "",
        dealRightText: product.dealRightText || "",
        dealRightIcon: product.dealRightIcon || "",
        dealRightTag: product.dealRightTag || "",
        taxNotice: product.taxNotice || "",
        laceLabel: product.laceLabel || "",
        selectedLength: length || "",
        selectedDensity: selectedDensity,
        selectedLaceSize: selectedLaceSize,
        shippingFee: product.shippingFee || 2500,
        deliveryText: product.deliveryText || "Jan. 22 - Feb. 04",
      });

      setCartItemId(newCartItemId);
      setCartItemQuantity(1);
    }
  };

  const handleIncreaseQuantity = () => {
    if (!isOutOfStock) {
      if (cartItemId && cartItemQuantity > 0) {
        const newQuantity = cartItemQuantity + 1;
        updateQuantity(cartItemId, newQuantity);
        setCartItemQuantity(newQuantity);
      } else {
        handleAddToCartClick(selectedLength);
      }
    }
  };

  const handleDecreaseQuantity = () => {
    if (cartItemId && cartItemQuantity > 0) {
      if (cartItemQuantity > 1) {
        const newQuantity = cartItemQuantity - 1;
        updateQuantity(cartItemId, newQuantity);
        setCartItemQuantity(newQuantity);
      } else if (cartItemQuantity === 1) {
        setShowRemoveConfirm(true);
      }
    }
  };

  const confirmRemoveFromCart = () => {
    if (cartItemId) {
      removeFromCart(cartItemId);
      setCartItemId("");
      setCartItemQuantity(0);
    }
    setShowRemoveConfirm(false);
  };

  const cancelRemoveFromCart = () => {
    setShowRemoveConfirm(false);
  };

  const getFullProductName = useCallback(() => {
    let fullName = product.name;
    if (hasLengthOptions && selectedLength) fullName += ` - ${selectedLength}`;
    if (hasDensityOptions && selectedDensity)
      fullName += ` - ${selectedDensity}`;
    if (hasLaceSizeOptions && selectedLaceSize) {
      const laceOption = laceSizeOptions.find(
        (opt) => opt.value === selectedLaceSize,
      );
      fullName += ` - ${laceOption?.label || selectedLaceSize}`;
    }
    return fullName;
  }, [
    product.name,
    hasLengthOptions,
    selectedLength,
    hasDensityOptions,
    selectedDensity,
    hasLaceSizeOptions,
    selectedLaceSize,
    laceSizeOptions,
  ]);

  const handleBuyNowClick = () => {
    if (!isOutOfStock) {
      const quantity = cartItemQuantity > 0 ? cartItemQuantity : 1;
      const params = new URLSearchParams({
        productId: product.id.toString(),
        productName: product.name,
        productImage: product.images?.[0] || "",
        length: selectedLength || "",
        density: selectedDensity || "",
        laceSize: selectedLaceSize || "",
        laceLabel: laceLabel || "",
        quantity: quantity.toString(),
        price: getCurrentPrice().toString(),
        originalPrice: getCurrentOriginalPrice()?.toString() || "",
        shippingFee: (product.shippingFee || 2500).toString(),
        deliveryText: product.deliveryText || "Jan. 22 - Feb. 04",
        fullProductName: getFullProductName(),
      });
      if (discountPercentage > 0) {
        params.append("discount", discountPercentage.toString());
      }
      window.location.href = `/checkout?${params.toString()}`;
    }
  };

  const leftDealText = product.dealLeftText || "SUPER DEAL";
  const rightDealText = product.dealRightText || "LIMITED OFFER";
  const taxNotice =
    product.taxNotice || "Tax excluded, add at checkout if applicable";
  const shippingFee = product.shippingFee || 2500;
  const deliveryText = product.deliveryText || "Jan. 22 - Feb. 04";

  const handleLengthSelect = (lengthValue: string) => {
    setSelectedLength(lengthValue);
    const selectedOption = lengthOptions.find(
      (opt) => opt.value === lengthValue,
    );
    if (selectedOption?.laceSize && hasLaceSizeOptions) {
      setSelectedLaceSize(selectedOption.laceSize);
    }
    const existingItem = findProductInCart(product.id);
    if (
      existingItem &&
      existingItem.selectedLength === lengthValue &&
      existingItem.selectedLaceSize ===
        (selectedOption?.laceSize || selectedLaceSize) &&
      existingItem.selectedDensity === selectedDensity
    ) {
      setCartItemId(existingItem.id);
      setCartItemQuantity(existingItem.quantity);
    } else {
      setCartItemId("");
      setCartItemQuantity(0);
    }
  };

  const handleLaceSizeSelect = (laceSizeValue: string) => {
    setSelectedLaceSize(laceSizeValue);
    if (selectedLength || !hasLengthOptions) {
      const existingItem = findProductInCart(product.id);
      if (
        existingItem &&
        existingItem.selectedLaceSize === laceSizeValue &&
        existingItem.selectedDensity === selectedDensity
      ) {
        setCartItemId(existingItem.id);
        setCartItemQuantity(existingItem.quantity);
      } else {
        setCartItemId("");
        setCartItemQuantity(0);
      }
    }
  };

  const handleDensitySelect = (densityValue: string) => {
    setSelectedDensity(densityValue);
    if (selectedLength || !hasLengthOptions) {
      const existingItem = findProductInCart(product.id);
      if (
        existingItem &&
        existingItem.selectedDensity === densityValue &&
        existingItem.selectedLaceSize === selectedLaceSize
      ) {
        setCartItemId(existingItem.id);
        setCartItemQuantity(existingItem.quantity);
      } else {
        setCartItemId("");
        setCartItemQuantity(0);
      }
    }
  };

  const displayProductName = getCleanProductName();

  return (
    <>
      <RemoveConfirmModal
        show={showRemoveConfirm}
        productName={displayProductName}
        onCancel={cancelRemoveFromCart}
        onConfirm={confirmRemoveFromCart}
      />

      <div className="lg:w-1/2 mt-[-3.5rem]">
        <div className="bg-white pt-2">
          <div className="mb-6">
            <ProductInfoSection
              product={product}
              currentPrice={currentPrice}
              currentOriginalPrice={currentOriginalPrice}
              discountPercentage={discountPercentage}
              isOutOfStock={isOutOfStock}
              formatPrice={formatPriceWithDecimals}
            />

            <OptionSelectors
              selectedLength={selectedLength}
              selectedDensity={selectedDensity}
              selectedLaceSize={selectedLaceSize}
              isOutOfStock={isOutOfStock}
              hasLengthOptions={hasLengthOptions!}
              hasDensityOptions={hasDensityOptions}
              hasLaceSizeOptions={hasLaceSizeOptions!}
              lengthOptions={lengthOptions}
              densityOptions={densityOptions.map((opt) => opt.value)}
              laceSizeOptions={laceSizeOptions}
              laceLabel={laceLabel}
              onLengthSelect={handleLengthSelect}
              onDensitySelect={handleDensitySelect}
              onLaceSizeSelect={handleLaceSizeSelect}
            />

            <ServiceCommitment
              product={product}
              formatPrice={formatPriceWithDecimals}
              onShowDeliveryModal={onShowDeliveryModal}
              onShowRefundModal={onShowRefundModal}
              onShowPrivacyModal={onShowPrivacyModal}
            />

            <ActionButtons
              isInCart={isInCart}
              isOutOfStock={isOutOfStock}
              cartItemQuantity={cartItemQuantity}
              onAddToCart={() => handleAddToCartClick(selectedLength)}
              onBuyNow={handleBuyNowClick}
              onIncreaseQuantity={handleIncreaseQuantity}
              onDecreaseQuantity={handleDecreaseQuantity}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export type { LengthOption, LaceSizeOption };
