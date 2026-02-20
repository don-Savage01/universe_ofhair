import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mlcmmbvifmgmrmfptbul.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Supabase key is not set");
  throw new Error("Supabase key is not set");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET all products
export async function GET() {
  try {
    console.log("GET /api/products - Fetching all products");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`GET /api/products - Found ${data?.length || 0} products`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();

    console.log("POST /api/products - Received product data:", productData);

    // CRITICAL FIX: Convert boolean in_stock to integer
    const inStockValue = productData.in_stock;
    console.log(
      "Original in_stock value:",
      inStockValue,
      "Type:",
      typeof inStockValue
    );

    let cleanedInStock: number;
    if (typeof inStockValue === "boolean") {
      cleanedInStock = inStockValue ? 1 : 0;
    } else if (typeof inStockValue === "string") {
      cleanedInStock = inStockValue.toLowerCase() === "true" ? 1 : 0;
    } else if (typeof inStockValue === "number") {
      cleanedInStock = inStockValue;
    } else {
      cleanedInStock = 0; // default
    }

    console.log(
      "Cleaned in_stock value:",
      cleanedInStock,
      "Type:",
      typeof cleanedInStock
    );

    // Prepare data for insertion with proper types
    const productToInsert: any = {
      name: String(productData.name || "Unnamed Product"),
      price: parseFloat(productData.price) || 0,
      category: String(productData.category || "Uncategorized"),
      in_stock: cleanedInStock, // Use the converted integer
      status: "published",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add optional fields if they exist
    if (productData.description !== undefined) {
      productToInsert.description = String(productData.description);
    }

    if (productData.original_price !== undefined) {
      productToInsert.original_price = parseFloat(productData.original_price);
    }

    if (productData.rating !== undefined) {
      productToInsert.rating = parseFloat(productData.rating) || 0;
    }

    if (productData.images !== undefined) {
      productToInsert.images = Array.isArray(productData.images)
        ? productData.images
        : [];
    }

    if (productData.features !== undefined) {
      productToInsert.features = Array.isArray(productData.features)
        ? productData.features
        : [];
    }

    if (productData.hair_info !== undefined) {
      productToInsert.hair_info = String(productData.hair_info);
    }

    if (productData.deal_left_text !== undefined) {
      productToInsert.deal_left_text = String(productData.deal_left_text);
    }

    if (productData.deal_right_text !== undefined) {
      productToInsert.deal_right_text = String(productData.deal_right_text);
    }

    if (productData.tax_notice !== undefined) {
      productToInsert.tax_notice = String(productData.tax_notice);
    }

    // NEW FIELDS: Product variations configuration - FIXED VERSION
    if (productData.length_options !== undefined) {
      // Check if it's an array and not empty
      if (
        Array.isArray(productData.length_options) &&
        productData.length_options.length > 0
      ) {
        productToInsert.length_options = productData.length_options;
      } else {
        productToInsert.length_options = null;
      }
    } else {
      productToInsert.length_options = null;
    }

    if (productData.lace_size_options !== undefined) {
      // Check if it's an array and not empty
      if (
        Array.isArray(productData.lace_size_options) &&
        productData.lace_size_options.length > 0
      ) {
        productToInsert.lace_size_options = productData.lace_size_options;
      } else {
        productToInsert.lace_size_options = null;
      }
    } else {
      productToInsert.lace_size_options = null;
    }

    if (productData.density_options !== undefined) {
      // Check if it's an array and not empty
      if (
        Array.isArray(productData.density_options) &&
        productData.density_options.length > 0
      ) {
        productToInsert.density_options = productData.density_options;
      } else {
        // Send NULL instead of ["200%"] for empty/undefined
        productToInsert.density_options = null;
      }
    } else {
      // If density_options is not provided, set to NULL
      productToInsert.density_options = null;
    }

    if (productData.shipping_fee !== undefined) {
      productToInsert.shipping_fee =
        parseFloat(productData.shipping_fee) || 2500;
    } else {
      productToInsert.shipping_fee = 2500; // Default shipping fee
    }

    if (productData.delivery_text !== undefined) {
      productToInsert.delivery_text = String(productData.delivery_text);
    } else {
      productToInsert.delivery_text = "Jan. 22 - Feb. 04"; // Default delivery text
    }

    if (productData.image_url !== undefined) {
      productToInsert.image_url = String(productData.image_url);
    }

    // Add other database columns with defaults if needed
    productToInsert.compare_at_price =
      parseFloat(productData.original_price) ||
      parseFloat(productData.price) ||
      0;
    productToInsert.hair_type = "";
    productToInsert.hair_texture = "";
    productToInsert.hair_color = "";
    productToInsert.density = productData.density_options?.[0] || null; // Set to null instead of "200%"
    productToInsert.cap_size = "";
    productToInsert.closure_type = "";
    productToInsert.review_count = 0;
    productToInsert.featured = false;

    console.log("Product data to insert:", productToInsert);

    const { data, error } = await supabase
      .from("products")
      .insert([productToInsert])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error details:", error);
      return NextResponse.json(
        {
          error: "Failed to create product",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("POST /api/products - Created product:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
