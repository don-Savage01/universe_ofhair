export interface Product {
  id: number;
  uuid?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  inStock: boolean;
  rating: number;
  images: string[];
  videoUrl?: string;
  video?: string;
  features: string[];
  hairInfo: string;
  dealLeftText: string;
  dealRightText: string;
  taxNotice: string;
  lengthOptions?: LengthOption[];
  laceSizeOptions?: LaceSizeOption[];
  densityOptions?: DensityOption[];
  shippingFee?: number;
  deliveryText?: string;
  laceLabel?: string;
}

export interface LengthOption {
  id?: string;
  value: string;
  label: string;
  price: number;
  originalPrice?: number;
  laceSize?: string;
}

export interface LaceSizeOption {
  value: string;
  label: string;
  priceMultiplier: number;
}

export interface DensityOption {
  value: string;
  label: string;
  prices: {
    lengthId: string;
    lengthValue: string;
    price: number;
  }[];
  additionalPrice?: number;
}

// ─── SINGLE SOURCE OF TRUTH FOR LENGTH ID ───────────────────────────────────
// Every place that creates or looks up a lengthId MUST use this function.
// This is what was broken before — three places were generating IDs differently.
export function makeLengthId(value: string): string {
  return `length-${value.replace(/inches?$/i, "").trim()}`;
}

export function getDensityPrice(
  density: DensityOption,
  lengthId: string,
  defaultPrice: number,
): number {
  if (!density.prices || density.prices.length === 0) return defaultPrice;
  const priceEntry = density.prices.find((p) => p.lengthId === lengthId);
  return priceEntry?.price || defaultPrice;
}

export interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  in_stock: number;
  rating?: number;
  created_at: string;
  updated_at: string;
  video?: string | null;
  lace_label?: string;
  length_options?: any;
  lace_size_options?: any;
  density_options?: any;
  hair_info?: string;
  deal_left_text?: string;
  deal_right_text?: string;
  tax_notice?: string;
  shipping_fee?: number;
  delivery_text?: string;
  images?: any;
  features?: any;
}

function parseJsonField(field: any): any[] {
  if (field === null || field === undefined) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    if (field.trim() === "") return [];
    try {
      const parsed = JSON.parse(field);
      return parsed === null ? [] : Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseDensityOptions(field: any): DensityOption[] {
  const parsed = parseJsonField(field);
  if (parsed.length === 0) return [];

  return parsed
    .map((item: any) => {
      if (typeof item === "string") {
        return { value: item, label: item, prices: [], additionalPrice: 0 };
      } else if (item && typeof item === "object") {
        const prices = Array.isArray(item.prices)
          ? item.prices.map((p: any) => ({
              lengthId: p.lengthId || "",
              lengthValue: p.lengthValue || "",
              price: typeof p.price === "number" ? p.price : 0,
            }))
          : [];
        return {
          value: item.value || "",
          label: item.label || item.value || "",
          prices,
          additionalPrice: item.additionalPrice || 0,
        };
      }
      return null;
    })
    .filter(Boolean) as DensityOption[];
}

function cleanImageUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  if (url.includes("images.unsplash.com")) return url.split("?")[0];
  return url;
}

export function transformSupabaseProduct(dbProduct: any): Product {
  const numericId =
    parseInt(dbProduct.id.replace(/\D/g, "").slice(0, 9)) || Date.now();
  let basePrice = dbProduct.price || 0;
  let originalPrice = dbProduct.original_price;

  const rawImages = parseJsonField(dbProduct.images);
  const features = parseJsonField(dbProduct.features);
  const lengthOptions = parseJsonField(dbProduct.length_options);
  const laceSizeOptions = parseJsonField(dbProduct.lace_size_options);
  const densityOptions = parseDensityOptions(dbProduct.density_options);

  // FIX: use makeLengthId so IDs are always consistent
  const processedLengthOptions = lengthOptions.map((opt: any) => {
    const cleanValue = (opt.value || "").replace(/inches?$/i, "").trim();
    return {
      id: opt.id || makeLengthId(cleanValue),
      value: cleanValue,
      label: opt.label || opt.value || "",
      price: opt.price || 0,
      originalPrice: opt.originalPrice,
      laceSize: opt.laceSize || "",
    };
  });

  const cleanedImages = rawImages
    .map((img: string) => cleanImageUrl(img))
    .filter((img: string) => img && img.trim() !== "");

  if (processedLengthOptions.length > 0) {
    basePrice = processedLengthOptions[0].price || basePrice;
    originalPrice = processedLengthOptions[0].originalPrice || originalPrice;
  }

  const parsedLaceSizeOptions = laceSizeOptions
    .map((option: any) => ({
      value: option.value || option || "",
      label: option.label || option.value || option || "",
      priceMultiplier: option.priceMultiplier || 0,
    }))
    .filter((opt: any) => opt.value && opt.value.trim() !== "");

  const rawVideo = dbProduct.video;
  let videoUrl: string | undefined = undefined;
  if (rawVideo !== null && rawVideo !== undefined && rawVideo !== "") {
    const videoStr = String(rawVideo).trim();
    if (videoStr.startsWith("http")) videoUrl = videoStr;
  }

  return {
    id: numericId,
    uuid: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || "",
    price: basePrice,
    originalPrice,
    category: (dbProduct.category || "Wigs").trim(),
    inStock: dbProduct.in_stock === 1,
    videoUrl,
    video: videoUrl,
    laceLabel: dbProduct.lace_label || "Lace size",
    lengthOptions:
      processedLengthOptions.length > 0 ? processedLengthOptions : undefined,
    laceSizeOptions:
      parsedLaceSizeOptions.length > 0 ? parsedLaceSizeOptions : undefined,
    densityOptions: densityOptions.length > 0 ? densityOptions : undefined,
    hairInfo: dbProduct.hair_info || "Premium quality human hair extension.",
    dealLeftText: dbProduct.deal_left_text || "SUPER DEAL",
    dealRightText: dbProduct.deal_right_text || "LIMITED OFFER",
    taxNotice:
      dbProduct.tax_notice || "Tax excluded, add at checkout if applicable",
    shippingFee: dbProduct.shipping_fee || 2500,
    deliveryText: dbProduct.delivery_text || "Jan. 22 - Feb. 04",
    images:
      cleanedImages.length > 0
        ? cleanedImages
        : ["https://via.placeholder.com/400x400"],
    features:
      features.length > 0
        ? features
        : ["100% Human Hair", "Natural Look & Feel"],
    rating: dbProduct.rating || 4.5,
  };
}

export function prepareProductForSupabase(productData: any): any {
  const videoValue = productData.video || productData.videoUrl;
  const processedVideo =
    videoValue === "" || videoValue === undefined ? null : videoValue;

  // FIX: use makeLengthId so IDs are always consistent
  const lengthOptions = (productData.lengthOptions || []).map((opt: any) => {
    const cleanValue = (opt.value || "").replace(/inches?$/i, "").trim();
    return {
      id: opt.id || makeLengthId(cleanValue),
      value: cleanValue,
      label: opt.label || `${cleanValue} inches`,
      price: opt.price || 0,
      originalPrice: opt.originalPrice,
      laceSize: opt.laceSize || "",
    };
  });

  // FIX: Always rebuild the prices array on save so it's never empty on first upload
  const densityOptions: DensityOption[] = (productData.densityOptions || [])
    .map((opt: any) => {
      if (!opt.value) return null;

      // Preserve any prices the admin already typed
      const existingPriceMap: Record<string, number> = {};
      (opt.prices || []).forEach((p: any) => {
        if (p.lengthId) existingPriceMap[p.lengthId] = p.price;
      });

      // Rebuild against current length options using makeLengthId
      const prices = lengthOptions.map((length: any) => ({
        lengthId: length.id, // always `length-{value}` from makeLengthId
        lengthValue: length.value,
        price:
          existingPriceMap[length.id] !== undefined
            ? existingPriceMap[length.id]
            : length.price,
      }));

      return {
        value: opt.value,
        label: opt.label || opt.value,
        prices,
        additionalPrice: opt.additionalPrice || 0,
      };
    })
    .filter((item: any): item is DensityOption => item !== null);

  return {
    name: productData.name,
    description: productData.description,
    price: parseFloat(productData.price) || 0,
    original_price: productData.originalPrice
      ? parseFloat(productData.originalPrice)
      : null,
    category: productData.category ? productData.category.trim() : "Wigs",
    in_stock: productData.inStock ? 1 : 0,
    rating: productData.rating ? parseFloat(productData.rating) : 4.5,
    video: processedVideo,
    lace_label: productData.laceLabel || "Lace size",
    length_options: lengthOptions,
    lace_size_options: productData.laceSizeOptions || [],
    density_options: densityOptions,
    hair_info: productData.hairInfo,
    deal_left_text: productData.dealLeftText,
    deal_right_text: productData.dealRightText,
    tax_notice: productData.taxNotice,
    shipping_fee: productData.shippingFee
      ? parseFloat(productData.shippingFee)
      : 2500,
    delivery_text: productData.deliveryText,
    images: productData.images || [],
    features: productData.features || [],
  };
}

export const getFirstImage = (product: Product): string => {
  if (product.images && product.images.length > 0) {
    return cleanImageUrl(product.images[0]);
  }
  return "https://via.placeholder.com/400x400";
};

export function formatNumberWithCommas(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) || 0 : value;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function parseCommaFormattedNumber(value: string): number {
  if (!value) return 0;
  return parseFloat(value.replace(/,/g, "")) || 0;
}
