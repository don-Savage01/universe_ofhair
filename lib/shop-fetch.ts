// lib/shop.ts (or lib/shop-fetch.ts)
import { supabase } from "./supabase";
import { transformSupabaseProduct, Product } from "@/app/shop/components/types";

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      // FIX: This forces the browser to skip its local cache
      .setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    if (error) {
      return [];
    }

    if (!data || data.length === 0) return [];

    // Transform database products to frontend format
    return data.map((product) => transformSupabaseProduct(product));
  } catch (error) {
    return [];
  }
}

// ✅ ADD THIS NEW FUNCTION
export async function fetchUniqueCategories(): Promise<string[]> {
  try {
    // Fetch only distinct categories from the database
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .not("category", "is", null)
      .order("category", { ascending: true });

    if (error) {
      return ["wigs", "closures", "bundles", "accessories"]; // Default fallback
    }

    if (!data || data.length === 0) {
      return ["wigs", "closures", "bundles", "accessories"]; // Default fallback
    }

    // Extract unique categories, normalize them (lowercase, trim)
    const categories = [
      ...new Set(
        data.map((item) => item.category?.trim().toLowerCase()).filter(Boolean), // Remove null/undefined/empty
      ),
    ] as string[];

    return categories;
  } catch (error) {
    return ["wigs", "closures", "bundles", "accessories"]; // Default fallback
  }
}
