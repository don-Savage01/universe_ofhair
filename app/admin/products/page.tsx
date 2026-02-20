"use client";

import { useState, useEffect } from "react";
import ProductForm from "../components/ProductForm/index";
import { Product, transformSupabaseProduct } from "@/app/shop/components/types";
import { supabase } from "@/lib/supabase";

// Extended interface for admin
interface AdminProduct extends Product {
  uuid?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [error, setError] = useState("");

  // Fetch products directly from Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: supabaseError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      // CRITICAL FIX: Use the SAME transformation function as your shop page
      const convertedProducts: AdminProduct[] = (data || []).map(
        (dbProduct: any) => {
          const transformed = transformSupabaseProduct(dbProduct);

          return {
            ...transformed,
            uuid: dbProduct.id, // Store the actual UUID
          };
        },
      );

      setProducts(convertedProducts);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (product: AdminProduct) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        if (!product.uuid) {
          throw new Error("Product UUID not found");
        }

        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", product.uuid);

        if (error) {
          throw new Error(`Delete failed: ${error.message}`);
        }

        alert("Product deleted successfully!");

        // Trigger shop refresh when deleting
        localStorage.setItem("shop-needs-refresh", Date.now().toString());

        fetchProducts();
      } catch (err: any) {
        alert(`Failed to delete product: ${err.message}`);
      }
    }
  };

  const handleFormSubmit = async (productData: any) => {
    try {
      // CRITICAL FIX: Preserve existing video if not changed
      let finalVideoValue = productData.video || null;

      // If editing and no new video provided, keep the existing one
      if (
        editingProduct &&
        editingProduct.uuid &&
        (!productData.video || productData.video === "")
      ) {
        finalVideoValue = editingProduct.videoUrl || null;
      }

      // Prepare data for Supabase
      const supabaseData: any = {
        name: productData.name,
        description: productData.description || "",
        price: parseFloat(productData.price) || 0,
        original_price: productData.originalPrice
          ? parseFloat(productData.originalPrice)
          : null,
        category: productData.category || "wigs",
        in_stock: productData.inStock ? 1 : 0,
        rating: parseFloat(productData.rating) || 4.5,
        images: productData.images || [],
        video: finalVideoValue, // Use the final video value
        features: productData.features || [],
        hair_info: productData.hairInfo || "",
        deal_left_text: productData.dealLeftText || "SUPER DEAL",
        deal_right_text: productData.dealRightText || "LIMITED OFFER",
        tax_notice:
          productData.taxNotice ||
          "Tax excluded, add at checkout if applicable",
        length_options: productData.lengthOptions || [],
        lace_size_options: productData.laceSizeOptions || [],
        density_options: productData.densityOptions || null,
        shipping_fee: parseFloat(productData.shippingFee) || 2500,
        delivery_text: productData.deliveryText || "Jan. 22 - Feb. 04",
      };

      // CRITICAL: Verify video is not a blob URL before saving
      if (
        supabaseData.video &&
        String(supabaseData.video).startsWith("blob:")
      ) {
        alert("Cannot save temporary video URL. Please re-upload the video.");
        return;
      }

      let successMessage = "";

      if (editingProduct && editingProduct.uuid) {
        // Update using UUID
        const { data, error } = await supabase
          .from("products")
          .update(supabaseData)
          .eq("id", editingProduct.uuid)
          .select();

        if (error) {
          throw new Error(`Failed to update: ${error.message}`);
        }

        successMessage = "Product updated successfully!";
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert([supabaseData])
          .select();

        if (error) {
          throw new Error(`Failed to create: ${error.message}`);
        }

        successMessage = "Product added successfully!";
      }

      // 🔥 CRITICAL FIX: Trigger shop refresh immediately
      localStorage.setItem("shop-needs-refresh", Date.now().toString());

      setShowForm(false);
      setEditingProduct(null);
      await fetchProducts(); // Refresh admin list

      alert(successMessage + " The shop page will update in a few seconds.");
    } catch (error: any) {
      alert(`Failed to save product: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 md:mb-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Product Management
            </h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Add, edit, and manage your products
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 md:px-6 md:py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-base md:text-lg whitespace-nowrap"
          >
            <span className="text-xl">+</span>
            Add New Product
          </button>
        </div>

        {/* Stats Cards - ALWAYS IN ROW */}
        <div className="flex flex-row gap-3 md:gap-4 mb-6 w-full overflow-x-auto">
          <div className="flex-1 min-w-0 bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium">Products</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                {products.length}
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0 bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium">In Stock</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                {products.filter((p) => p.inStock).length}
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0 bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium">With Video</p>
              <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                {products.filter((p) => p.videoUrl).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg w-full">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-1">
            Please check your connection and try again.
          </p>
        </div>
      )}

      {/* Form or Table */}
      {showForm ? (
        <div className="w-full">
          <ProductForm
            product={editingProduct}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      ) : (
        <div className="w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full divide-y divide-gray-200 min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Product
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Category
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Price
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Rating
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 relative">
                          {product.images?.[0] &&
                          product.images[0].startsWith("http") ? (
                            <div className="relative h-12 w-12 md:h-14 md:w-14">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-12 w-12 md:h-14 md:w-14 rounded-lg object-cover"
                              />
                              {product.videoUrl && (
                                <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-[8px] px-1 py-0.5 rounded">
                                  VIDEO
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-12 w-12 md:h-14 md:w-14 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-500 text-xl">📦</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                            {product.videoUrl && (
                              <span className="ml-2 text-blue-500 text-xs">
                                🎥
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {product.description}
                          </div>
                          {product.videoUrl && (
                            <div className="text-xs text-gray-400 mt-1">
                              Has video
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full whitespace-nowrap">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        ₦{product.price.toLocaleString()}
                      </div>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <div className="text-xs text-gray-500 line-through mt-1 whitespace-nowrap">
                            ₦{product.originalPrice.toLocaleString()}
                          </div>
                        )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 mr-1">
                          {product.rating}
                        </span>
                        <span className="text-yellow-400">★</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors font-medium whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-md transition-colors font-medium whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && !loading && (
              <div className="text-center py-16 w-full">
                <div className="text-gray-400 mb-4">
                  <span className="text-5xl">📦</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get started by adding your first product to your catalog.
                </p>
                <button
                  onClick={handleAddProduct}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <span className="text-xl">+</span>
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
