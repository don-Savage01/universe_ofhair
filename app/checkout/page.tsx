"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  // Form fields - VISIBLE on the page
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Error states
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [locationError, setLocationError] = useState("");

  // ✅ FIX: Store and restore ALL product data from sessionStorage
  const [productData, setProductData] = useState({
    productId: "",
    productName: "",
    productImage: "",
    selectedLength: "",
    selectedDensity: "",
    selectedLaceSize: "",
    laceLabel: "Lace size",
    quantity: 1,
    price: 0,
    originalPrice: null as number | null,
    discount: 0,
    shippingFee: 2500,
    deliveryText: "Jan. 22 - Feb. 04",
    fullProductName: "",
  });

  // ✅ CRITICAL FIX: Save and restore ALL checkout data
  useEffect(() => {
    // Check if we're on checkout page but have no params (coming back from Terms/Privacy)
    const hasParams = searchParams.get("productId");

    if (!hasParams) {
      // Try to restore from sessionStorage
      const savedData = sessionStorage.getItem("checkoutProductData");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setProductData(parsed);
        setIsRestored(true);

        // Restore URL params (optional - for sharing)
        const urlParams = new URLSearchParams();
        Object.entries(parsed).forEach(([key, value]) => {
          if (value) urlParams.set(key, value as string);
        });
        window.history.replaceState(
          {},
          "",
          `/checkout?${urlParams.toString()}`,
        );
      }
    } else {
      // We have params, load from URL
      const newProductData = {
        productId: searchParams.get("productId") || "",
        productName: searchParams.get("productName") || "",
        productImage: searchParams.get("productImage") || "",
        selectedLength: searchParams.get("length") || "",
        selectedDensity: searchParams.get("density") || "",
        selectedLaceSize: searchParams.get("laceSize") || "",
        laceLabel: searchParams.get("laceLabel") || "Lace size",
        quantity: parseInt(searchParams.get("quantity") || "1"),
        price: parseFloat(searchParams.get("price") || "0"),
        originalPrice: searchParams.get("originalPrice")
          ? parseFloat(searchParams.get("originalPrice")!)
          : null,
        discount: searchParams.get("discount")
          ? parseInt(searchParams.get("discount")!)
          : 0,
        shippingFee: parseFloat(searchParams.get("shippingFee") || "2500"),
        deliveryText: searchParams.get("deliveryText") || "Jan. 22 - Feb. 04",
        fullProductName:
          searchParams.get("fullProductName") ||
          searchParams.get("productName") ||
          "",
      };

      setProductData(newProductData);
      setIsRestored(true);

      // Save to sessionStorage for future navigation
      sessionStorage.setItem(
        "checkoutProductData",
        JSON.stringify(newProductData),
      );
    }
  }, [searchParams]);

  // Calculate totals
  const itemTotal = productData.price * productData.quantity;
  const totalAmount = itemTotal + productData.shippingFee;

  // Format price
  const formatPrice = (amount: number) => {
    return `NGN ${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Validate form with INSTANT scroll
  const validateForm = () => {
    let isValid = true;

    let localFirstNameError = "";
    let localLastNameError = "";
    let localEmailError = "";
    let localPhoneError = "";
    let localLocationError = "";

    if (!firstName.trim()) {
      localFirstNameError = "First name is required";
      setFirstNameError("First name is required");
      isValid = false;
    } else {
      setFirstNameError("");
    }

    if (!lastName.trim()) {
      localLastNameError = "Last name is required";
      setLastNameError("Last name is required");
      isValid = false;
    } else {
      setLastNameError("");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      localEmailError = "Email is required";
      setEmailError("Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      localEmailError = "Please enter a valid email address";
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }

    const phoneRegex = /^(?:\+?234|0)[7-9][0-1]\d{8}$/;
    if (!phone) {
      localPhoneError = "Phone number is required";
      setPhoneError("Phone number is required");
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      localPhoneError = "Please enter a valid Nigerian phone number";
      setPhoneError("Please enter a valid Nigerian phone number");
      isValid = false;
    } else {
      setPhoneError("");
    }

    if (!location.trim()) {
      localLocationError = "Delivery location is required";
      setLocationError("Delivery location is required");
      isValid = false;
    } else {
      setLocationError("");
    }

    if (!isValid) {
      if (localFirstNameError) {
        document.getElementById("first-name-field")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document.getElementById("first-name-field")?.focus();
      } else if (localLastNameError) {
        document.getElementById("last-name-field")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document.getElementById("last-name-field")?.focus();
      } else if (localEmailError) {
        document.getElementById("email-field")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document.getElementById("email-field")?.focus();
      } else if (localPhoneError) {
        document.getElementById("phone-field")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document.getElementById("phone-field")?.focus();
      } else if (localLocationError) {
        document.getElementById("location-field")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document.getElementById("location-field")?.focus();
      }
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    handlePaymentRedirect();
  };

  // Load Paystack script
  useEffect(() => {
    if ((window as any).PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      setPaystackLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Reset processing state when component unmounts
  useEffect(() => {
    return () => {
      setProcessing(false);
    };
  }, []);

  // Handle payment redirect
  const handlePaymentRedirect = async () => {
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      const orderReference = `HAIR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const fullName = `${firstName} ${lastName}`.trim();

      const metadata = {
        customer_name: fullName || "Valued Customer",
        customer_email: email,
        customer_phone: phone,
        customer_location: location,
        customer_first_name: firstName,
        customer_last_name: lastName,
        product_id: productData.productId,
        product_name: productData.fullProductName,
        selected_length: productData.selectedLength || "",
        selected_density: productData.selectedDensity || "",
        selected_lace_size: productData.selectedLaceSize || "",
        quantity: productData.quantity,
        item_price: productData.price,
        item_total: itemTotal,
        shipping_fee: productData.shippingFee,
        delivery_text: productData.deliveryText,
        total_amount: totalAmount,
        discount: productData.discount || 0,
        original_price: productData.originalPrice || productData.price,
        order_reference: orderReference,
      };

      const response = await fetch("/api/initialize-paystack", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(totalAmount * 100),
          metadata,
        }),
      });

      const data = await response.json();

      if (data.success && data.authorization_url) {
        sessionStorage.setItem(
          "pendingOrder",
          JSON.stringify({
            orderReference,
            email,
            fullName,
            productName: productData.fullProductName,
            price: productData.price,
            quantity: productData.quantity,
            shippingFee: productData.shippingFee,
            deliveryText: productData.deliveryText,
            totalAmount,
            selectedLength: productData.selectedLength,
            selectedDensity: productData.selectedDensity,
            selectedLaceSize: productData.selectedLaceSize,
            phone,
            location,
            firstName,
            lastName,
          }),
        );

        window.location.href = data.authorization_url;
      } else {
        throw new Error(data.error || "Failed to initialize payment");
      }
    } catch (error: any) {
      alert(
        "Unable to initialize payment. Please check your internet connection and try again.",
      );
      setProcessing(false);
    }
  };

  // Don't render until restored
  if (!isRestored) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-5 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2">
            {/* Product Order Summary Card */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-3 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                Order Summary
              </h2>

              <div className="flex flex-col items-center">
                {/* Product Image - Centered - NOW FROM SESSION STORAGE! */}
                <div className="w-48 h-48 bg-gray-100 rounded-xl overflow-hidden mb-6 shadow-md">
                  {productData.productImage ? (
                    <Image
                      src={productData.productImage}
                      alt={productData.productName || "Product"}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                      loading="eager"
                      priority
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 text-center mb-4">
                  {productData.productName}
                </h3>

                {/* Product Details Grid */}
                <div className="w-full max-w-md bg-gray-50 rounded-sm p-5">
                  <div className="space-y-3">
                    {productData.selectedLength && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600 font-medium text-sm">
                          Length:
                        </span>
                        <span className="font-semibold text-gray-900 text-xs">
                          {productData.selectedLength}
                        </span>
                      </div>
                    )}

                    {productData.selectedDensity && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600 font-medium text-sm">
                          Density:
                        </span>
                        <span className="font-semibold text-gray-900 text-xs">
                          {productData.selectedDensity}
                        </span>
                      </div>
                    )}

                    {productData.selectedLaceSize && (
                      <div className="flex justify-between items-center py-1 border-b border-gray-200">
                        <span className="text-gray-600 font-medium text-sm">
                          {productData.laceLabel}:
                        </span>
                        <span className="font-semibold text-gray-900 text-xs">
                          {productData.selectedLaceSize}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-1 border-b border-gray-200">
                      <span className="text-gray-600 font-medium text-sm">
                        Quantity:
                      </span>
                      <span className="font-semibold text-gray-900 text-xs">
                        {productData.quantity}
                      </span>
                    </div>

                    <div className="flex flex-col items-end py-1">
                      <div className="flex justify-between w-full">
                        <span className="text-gray-600 font-medium text-sm">
                          Price:
                        </span>
                        <span className="font-bold text-gray-900 text-sm">
                          {formatPrice(productData.price)}
                        </span>
                      </div>
                      {productData.originalPrice &&
                        productData.originalPrice > productData.price && (
                          <div className="flex justify-end w-full mt-0.5">
                            <span className="text-gray-400 line-through text-xs">
                              {formatPrice(productData.originalPrice)}
                            </span>
                          </div>
                        )}
                    </div>

                    {productData.discount > 0 && (
                      <div className="flex justify-end mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Save {productData.discount}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-3 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                Your Information
              </h3>

              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div id="first-name-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setFirstNameError("");
                      }}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
                        firstNameError
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="First Name"
                    />
                    {firstNameError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {firstNameError}
                      </p>
                    )}
                  </div>

                  <div id="last-name-field">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setLastNameError("");
                      }}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
                        lastNameError
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Last Name"
                    />
                    {lastNameError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {lastNameError}
                      </p>
                    )}
                  </div>
                </div>

                <div id="email-field">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
                      emailError
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="you@example.com"
                  />
                  {emailError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {emailError}
                    </p>
                  )}
                </div>

                <div id="phone-field">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError("");
                    }}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
                      phoneError
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="08012222222"
                  />
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {phoneError}
                    </p>
                  )}
                </div>

                <div id="location-field">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Location <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setLocationError("");
                    }}
                    rows={3}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition resize-none ${
                      locationError
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your full delivery address (street, city, state)"
                  />
                  {locationError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {locationError}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
                Delivery Information
              </h3>
              <div className="bg-blue-50 rounded-sm p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-90 text-xs">
                      Standard Shipping
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {productData.deliveryText}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 text-xs">
                    {formatPrice(productData.shippingFee)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Payment Summary
              </h2>

              <div className="space-y-3 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Price per item</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {formatPrice(productData.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Quantity</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {productData.quantity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Subtotal</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {formatPrice(itemTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Shipping</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {formatPrice(productData.shippingFee)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-base font-semibold text-gray-900 text-sm">
                  Total
                </span>
                <div className="text-right">
                  <span className="font-medium text-green-600 text-sm">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={processing || !paystackLoaded}
                className={`w-full py-4 px-4 rounded-xl font-semibold text-white transition-all ${
                  processing || !paystackLoaded
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Complete Order"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing this order, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-green-500 hover:underline font-medium"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-green-500 hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
