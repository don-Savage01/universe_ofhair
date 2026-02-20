import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://mlcmmbvifmgmrmfptbul.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error("Supabase key is not set");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to clean product data
function cleanProductData(productData: any) {
  const cleaned: any = {};

  // Handle in_stock conversion
  if (productData.in_stock !== undefined) {
    const inStockValue = productData.in_stock;
    if (typeof inStockValue === "boolean") {
      cleaned.in_stock = inStockValue ? 1 : 0;
    } else if (typeof inStockValue === "string") {
      cleaned.in_stock = inStockValue.toLowerCase() === "true" ? 1 : 0;
    } else {
      cleaned.in_stock = inStockValue;
    }
  }

  // Copy other fields
  Object.keys(productData).forEach((key) => {
    if (key !== "in_stock" && productData[key] !== undefined) {
      cleaned[key] = productData[key];
    }
  });

  cleaned.updated_at = new Date().toISOString();
  return cleaned;
}

// GET single product - THIS ONE HAS PARAMS!
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", numericId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PUT update product - THIS ONE HAS PARAMS!
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    const productData = await request.json();

    // Clean the data (especially in_stock conversion)
    const cleanedData = cleanProductData(productData);

    const { data, error } = await supabase
      .from("products")
      .update(cleanedData)
      .eq("id", numericId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update product", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// DELETE product - THIS ONE HAS PARAMS!
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", numericId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete product", details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
