"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Product,
  LengthOption,
  LaceSizeOption,
  DensityOption,
  makeLengthId,
} from "@/app/shop/components/types";
import BasicInfoSection from "./BasicInfoSection";
import PriceConfigSection from "./PriceConfigSection";
import LengthOptionsSection from "./LengthOptionsSection";
import LaceSizeSection from "./LaceSizeSection";
import DensityOptionsSection from "./DensityOptionsSection";
import ImagesSection from "./ImagesSection";
import VideoSection from "./VideoSection";
import HairInfoSection from "./HairInfoSection";
import DealTextSection from "./DealTextSection";
import ShippingSection from "./ShippingSection";
import TaxNoticeSection from "./TaxNoticeSection";
import StarRatingSelector from "./StarRatingSelector";
import {
  formatNumberWithCommas,
  parseCommaFormattedNumber,
  uploadImagesToSupabase,
  uploadVideoToSupabase,
  deleteVideoFromSupabase,
  calculateDeliveryDates,
  DENSITY_MULTIPLIERS,
  filterValidFiles,
} from "./utils";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "wigs",
    inStock: true,
    rating: "4.5",
    features: "",
    hairInfo: "",
    dealLeftText: "SUPER DEAL",
    dealRightText: "LIMITED OFFER",
    taxNotice: "Tax excluded, add at checkout if applicable",
    shippingFee: "2,500",
    deliveryText: calculateDeliveryDates(),
    price: "0",
    originalPrice: "",
    laceLabel: "Lace size",
  });

  const [desiredAmount, setDesiredAmount] = useState<number>(0);
  const [showFeeCalculator, setShowFeeCalculator] = useState(false);

  const [lengthOptions, setLengthOptions] = useState<LengthOption[]>([
    {
      id: makeLengthId(""),
      value: "",
      label: "",
      price: 0,
      originalPrice: undefined,
      laceSize: "",
    },
  ]);
  const [laceSizeOptions, setLaceSizeOptions] = useState<LaceSizeOption[]>([]);
  const [densityOptions, setDensityOptions] = useState<DensityOption[]>([]);
  const [enableLengthOptions, setEnableLengthOptions] = useState(false);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string>("");
  const [videoToRemove, setVideoToRemove] = useState<boolean>(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [duplicateErrors, setDuplicateErrors] = useState({
    lengthValues: new Set<string>(),
    laceValues: new Set<string>(),
    densityValues: new Set<string>(),
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    return () => {
      if (videoPreview && videoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreview);
      }
      imagePreviews.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
      blobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {}
      });
      blobUrlsRef.current.clear();
    };
  }, [videoPreview, imagePreviews]);

  useEffect(() => {
    if (product) {
      const shippingFeeFormatted = product.shippingFee
        ? formatNumberWithCommas(product.shippingFee)
        : "2,500";

      const priceFormatted = product.price
        ? formatNumberWithCommas(product.price)
        : "0";

      const originalPriceFormatted = product.originalPrice
        ? formatNumberWithCommas(product.originalPrice)
        : "";

      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "wigs",
        inStock: product.inStock !== false,
        rating: (product.rating || 4.5).toString(),
        features: product.features?.join("\n") || "",
        hairInfo: product.hairInfo || "",
        dealLeftText: product.dealLeftText || "SUPER DEAL",
        dealRightText: product.dealRightText || "LIMITED OFFER",
        taxNotice:
          product.taxNotice || "Tax excluded, add at checkout if applicable",
        shippingFee: shippingFeeFormatted,
        deliveryText: product.deliveryText || calculateDeliveryDates(),
        price: priceFormatted,
        originalPrice: originalPriceFormatted,
        laceLabel: product.laceLabel || "Lace wig",
      });

      if (product.price) {
        setDesiredAmount(product.price);
      }

      setImagePreviews(product.images || []);

      const videoUrl = product.videoUrl || product.video;
      if (videoUrl) {
        setExistingVideoUrl(videoUrl);
      } else {
        setExistingVideoUrl("");
      }

      if (product.lengthOptions && product.lengthOptions.length > 0) {
        const optionsWithIds = product.lengthOptions.map((opt) => ({
          ...opt,
          id: opt.id || makeLengthId(opt.value),
        }));
        setLengthOptions(optionsWithIds);
        setEnableLengthOptions(true);
      }

      if (product.laceSizeOptions && product.laceSizeOptions.length > 0) {
        setLaceSizeOptions(product.laceSizeOptions);
      }

      if (product.densityOptions && product.densityOptions.length > 0) {
        const firstOption = product.densityOptions[0];

        if (typeof firstOption === "string") {
          const convertedOptions = product.densityOptions.map((opt: any) => ({
            value: opt,
            label: opt,
            additionalPrice: 0,
            prices: [],
          }));
          setDensityOptions(convertedOptions);
        } else {
          setDensityOptions(product.densityOptions as DensityOption[]);
        }
      } else {
        setDensityOptions([]);
      }
    } else {
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
      setExistingVideoUrl("");
      setVideoToRemove(false);
      setDensityOptions([]);
      setLaceSizeOptions([]);
      setLengthOptions([
        {
          id: makeLengthId(""),
          value: "",
          label: "",
          price: 0,
          originalPrice: undefined,
          laceSize: "",
        },
      ]);
      setEnableLengthOptions(false);
      setDesiredAmount(0);
      setShowFeeCalculator(false);
    }
  }, [product]);

  const handleRemoveExistingVideo = () => {
    if (videoPreview && videoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
      blobUrlsRef.current.delete(videoPreview);
    }
    setExistingVideoUrl("");
    setVideoFile(null);
    setVideoPreview(null);
    setVideoToRemove(true);
  };

  const triggerFileInput = () => {
    if (isClient && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const checkForDuplicates = () => {
    const lengthValues = new Set<string>();
    const laceValues = new Set<string>();
    const densityValues = new Set<string>();
    let hasDuplicates = false;

    lengthOptions.forEach((option) => {
      if (option.value && lengthValues.has(option.value)) {
        hasDuplicates = true;
      }
      lengthValues.add(option.value);
    });

    laceSizeOptions.forEach((option) => {
      if (option.value && laceValues.has(option.value)) {
        hasDuplicates = true;
      }
      laceValues.add(option.value);
    });

    densityOptions.forEach((option) => {
      if (option.value && densityValues.has(option.value)) {
        hasDuplicates = true;
      }
      densityValues.add(option.value);
    });

    setDuplicateErrors({ lengthValues, laceValues, densityValues });
    return hasDuplicates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (checkForDuplicates()) {
      alert("Please fix duplicate values before submitting!");
      return;
    }

    if (
      !enableLengthOptions &&
      parseCommaFormattedNumber(formData.price) <= 0
    ) {
      alert("Please set a valid base price!");
      return;
    }

    const rating = parseFloat(formData.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      alert("Please enter a valid rating between 0 and 5!");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // ✅ FIX: exclude data URLs and blob URLs from existing URLs
      const existingImageUrls = imagePreviews.filter(
        (url) =>
          !url.startsWith("blob:") &&
          !url.startsWith("data:") &&
          url.includes("http"),
      );

      if (existingImageUrls.length === 0 && imageFiles.length === 0) {
        alert("Please upload at least one image!");
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      let finalImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const validImageFiles = filterValidFiles(imageFiles);
        if (validImageFiles.length > 0) {
          try {
            setUploadProgress(20);
            finalImageUrls = await uploadImagesToSupabase(validImageFiles);
            setUploadProgress(50);
          } catch (uploadError) {
            if (uploadError instanceof Error) {
              const errorMessage = uploadError.message.toLowerCase();
              if (
                errorMessage.includes("network") ||
                errorMessage.includes("fetch") ||
                errorMessage.includes("failed to fetch") ||
                errorMessage.includes("internet") ||
                errorMessage.includes("connection")
              ) {
                alert(
                  "Network connection issue. Please check your internet connection and try again.",
                );
              } else {
                alert(`Upload failed: ${uploadError.message}`);
              }
            } else {
              alert("Upload failed due to an unknown error.");
            }
            setUploading(false);
            setUploadProgress(0);
            return;
          }
        }
      }

      // ✅ FIX: Preserve thumbnail order by mapping imagePreviews in order
      // Track which new file index we're on as we encounter non-http previews
      let newFileIndex = 0;
      const allImageUrls: string[] = imagePreviews
        .map((preview) => {
          if (
            !preview.startsWith("blob:") &&
            !preview.startsWith("data:") &&
            preview.includes("http")
          ) {
            // It's an existing Supabase URL — keep it as-is
            return preview;
          } else {
            // It's a newly uploaded file — map to the uploaded URL in order
            const uploadedUrl = finalImageUrls[newFileIndex] || null;
            newFileIndex++;
            return uploadedUrl;
          }
        })
        .filter(Boolean) as string[];

      if (allImageUrls.length === 0) {
        alert("No images available. Please upload at least one image!");
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(60);

      let finalVideoUrl: string | undefined = undefined;

      if (videoFile) {
        try {
          finalVideoUrl = await uploadVideoToSupabase(videoFile);
          setUploadProgress(80);
          if (existingVideoUrl && existingVideoUrl !== finalVideoUrl) {
            try {
              await deleteVideoFromSupabase(existingVideoUrl);
            } catch (error) {}
          }
        } catch (uploadError) {
          if (uploadError instanceof Error) {
            const errorMessage = uploadError.message.toLowerCase();
            if (
              errorMessage.includes("network") ||
              errorMessage.includes("fetch") ||
              errorMessage.includes("failed to fetch") ||
              errorMessage.includes("internet") ||
              errorMessage.includes("connection")
            ) {
              alert(
                "Network connection issue while uploading video. Please check your internet connection and try again.",
              );
            } else {
              alert(`Video upload failed: ${uploadError.message}`);
            }
          } else {
            alert("Video upload failed due to an unknown error.");
          }
          setUploading(false);
          setUploadProgress(0);
          return;
        }
      } else if (
        existingVideoUrl &&
        existingVideoUrl.trim() !== "" &&
        !videoToRemove
      ) {
        finalVideoUrl = existingVideoUrl;
      } else if (videoToRemove) {
        if (existingVideoUrl) {
          try {
            await deleteVideoFromSupabase(existingVideoUrl);
          } catch (error) {}
        }
        finalVideoUrl = undefined;
      } else if (product?.videoUrl && !videoToRemove) {
        finalVideoUrl = product.videoUrl;
      }

      setUploadProgress(90);

      let basePrice = 0;
      let baseOriginalPrice = undefined;

      if (enableLengthOptions && lengthOptions.length > 0) {
        const validLengthOptions = lengthOptions.filter((opt) => opt.price > 0);
        if (validLengthOptions.length > 0) {
          basePrice = validLengthOptions[0].price;
          baseOriginalPrice = validLengthOptions[0].originalPrice;
        }
      } else {
        basePrice = parseCommaFormattedNumber(formData.price);
        baseOriginalPrice = formData.originalPrice
          ? parseCommaFormattedNumber(formData.originalPrice)
          : undefined;
      }

      const productData = {
        ...formData,
        video: finalVideoUrl,
        videoUrl: finalVideoUrl,
        price: basePrice,
        originalPrice: baseOriginalPrice,
        rating: parseFloat(formData.rating) || 4.5,
        images: allImageUrls,
        features: formData.features.split("\n").filter((f) => f.trim()),
        inStock: Boolean(formData.inStock),
        lengthOptions:
          enableLengthOptions && lengthOptions.length > 0
            ? lengthOptions.filter((opt) => opt.value && opt.price > 0)
            : null,
        laceSizeOptions:
          laceSizeOptions.length > 0
            ? laceSizeOptions.filter((opt) => opt.value)
            : null,
        densityOptions:
          densityOptions.length > 0
            ? densityOptions.filter((opt) => opt.value && opt.value.trim())
            : null,
        shippingFee: parseCommaFormattedNumber(formData.shippingFee) || 2500,
        deliveryText: formData.deliveryText,
        laceLabel:
          laceSizeOptions.length > 0 ? formData.laceLabel || "Lace wig" : "",
        enableLengthOptions: enableLengthOptions,
      };

      setUploadProgress(100);
      onSubmit(productData);
    } catch (error) {
      alert(
        "Failed to upload media. Please check your connection and try again.",
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (
      name === "price" ||
      name === "originalPrice" ||
      name === "shippingFee"
    ) {
      const numericValue = value.replace(/[^\d.]/g, "");
      const formattedValue = numericValue
        ? formatNumberWithCommas(parseFloat(numericValue) || 0)
        : "";

      setFormData((prev) => ({ ...prev, [name]: formattedValue }));

      if (name === "price") {
        const numericAmount = parseFloat(numericValue) || 0;
        setDesiredAmount(numericAmount);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const addLengthOption = () => {
    const newOption: LengthOption = {
      id: makeLengthId(`new-${Date.now()}`),
      value: "",
      label: "",
      price: 0,
      originalPrice: undefined,
      laceSize: laceSizeOptions[0]?.value || "",
    };
    setLengthOptions([...lengthOptions, newOption]);
  };

  const updateLengthOption = (
    index: number,
    field: keyof LengthOption,
    value: any,
  ) => {
    const updated = [...lengthOptions];

    if (field === "price" || field === "originalPrice") {
      const numericValue =
        typeof value === "string" ? parseCommaFormattedNumber(value) : value;
      updated[index] = { ...updated[index], [field]: numericValue };
    } else if (field === "value") {
      let formattedValue = value;
      formattedValue = formattedValue.replace(/\s*(inches|inch)\s*/gi, "");
      const newId = makeLengthId(formattedValue);
      if (formattedValue.match(/^\d+$/)) {
        formattedValue = `${formattedValue}inches`;
      }
      updated[index] = {
        ...updated[index],
        id: newId,
        [field]: formattedValue,
        label: formattedValue,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setLengthOptions(updated);
    checkForDuplicates();
  };

  const removeLengthOption = (index: number) => {
    if (lengthOptions.length > 1) {
      setLengthOptions(lengthOptions.filter((_, i) => i !== index));
    }
    checkForDuplicates();
  };

  const addLaceSizeOption = () => {
    const newOption: LaceSizeOption = {
      value: "",
      label: "",
      priceMultiplier: 0,
    };
    setLaceSizeOptions([...laceSizeOptions, newOption]);
  };

  const updateLaceSizeOption = (
    index: number,
    field: keyof LaceSizeOption,
    value: any,
  ) => {
    const updated = [...laceSizeOptions];

    if (field === "priceMultiplier") {
      const numericValue =
        typeof value === "string" ? parseCommaFormattedNumber(value) : value;
      updated[index] = { ...updated[index], [field]: numericValue };
    } else if (field === "value") {
      updated[index] = { ...updated[index], [field]: value, label: value };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setLaceSizeOptions(updated);
    checkForDuplicates();
  };

  const removeLaceSizeOption = (index: number) => {
    setLaceSizeOptions(laceSizeOptions.filter((_, i) => i !== index));
    checkForDuplicates();
  };

  const addDensityOption = () => {
    const newOption: DensityOption = {
      value: "",
      label: "",
      additionalPrice: 0,
      prices: [],
    };
    setDensityOptions([...densityOptions, newOption]);
    checkForDuplicates();
  };

  const updateDensityOption = (
    index: number,
    field: keyof DensityOption,
    value: any,
  ) => {
    const updated = [...densityOptions];

    if (field === "additionalPrice") {
      const numericValue =
        typeof value === "string" ? parseCommaFormattedNumber(value) : value;
      updated[index] = { ...updated[index], [field]: numericValue || 0 };
    } else if (field === "value") {
      const newValue = value;
      const currentOption = updated[index];
      const shouldAutoGenerate =
        !currentOption.label ||
        currentOption.label ===
          `${currentOption.value.replace("%", "")}% Density`;
      updated[index] = {
        ...currentOption,
        value: newValue,
        label: shouldAutoGenerate
          ? newValue
            ? `${newValue.replace("%", "")}% Density`
            : ""
          : currentOption.label,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setDensityOptions(updated);
    checkForDuplicates();
  };

  const removeDensityOption = (index: number) => {
    if (index === 0 && densityOptions.length > 1) {
      const updated = [...densityOptions];
      updated.splice(index, 1);
      updated[0].additionalPrice = 0;
      setDensityOptions(updated);
    } else if (index > 0) {
      setDensityOptions(densityOptions.filter((_, i) => i !== index));
    }
    checkForDuplicates();
  };

  const isDuplicate = (
    type: "length" | "lace" | "density",
    value: string,
    index: number,
  ) => {
    if (!value || value.trim() === "") return false;

    const values =
      type === "length"
        ? duplicateErrors.lengthValues
        : type === "lace"
          ? duplicateErrors.laceValues
          : duplicateErrors.densityValues;

    const valuesArray = Array.from(values);
    const firstIndex = valuesArray.indexOf(value);
    return firstIndex !== -1 && firstIndex !== index;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {product ? "Edit Product" : "Add New Product"}
        </h2>
        <button
          onClick={onCancel}
          className="text-red-500 hover:text-gray-800 bg-red-200 px-1 rounded-sm"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 w-full">
        <BasicInfoSection
          formData={formData}
          handleChange={handleChange}
          StarRatingSelector={() => (
            <StarRatingSelector
              rating={formData.rating}
              setRating={(rating) =>
                setFormData((prev) => ({ ...prev, rating }))
              }
            />
          )}
        />

        <PriceConfigSection
          formData={formData}
          handleChange={handleChange}
          enableLengthOptions={enableLengthOptions}
          setEnableLengthOptions={setEnableLengthOptions}
          desiredAmount={desiredAmount}
          setDesiredAmount={setDesiredAmount}
          showFeeCalculator={showFeeCalculator}
          setShowFeeCalculator={setShowFeeCalculator}
        />

        {enableLengthOptions && (
          <LengthOptionsSection
            lengthOptions={lengthOptions}
            addLengthOption={addLengthOption}
            updateLengthOption={updateLengthOption}
            removeLengthOption={removeLengthOption}
            laceSizeOptions={laceSizeOptions}
            isDuplicate={isDuplicate}
            formatNumberWithCommas={formatNumberWithCommas}
          />
        )}

        <LaceSizeSection
          formData={formData}
          handleChange={handleChange}
          laceSizeOptions={laceSizeOptions}
          addLaceSizeOption={addLaceSizeOption}
          updateLaceSizeOption={updateLaceSizeOption}
          removeLaceSizeOption={removeLaceSizeOption}
          isDuplicate={isDuplicate}
          formatNumberWithCommas={formatNumberWithCommas}
        />

        <DensityOptionsSection
          densityOptions={densityOptions}
          lengthOptions={lengthOptions}
          addDensityOption={addDensityOption}
          updateDensityOption={updateDensityOption}
          removeDensityOption={removeDensityOption}
          isDuplicate={isDuplicate}
        />

        <ImagesSection
          imageFiles={imageFiles}
          setImageFiles={setImageFiles}
          imagePreviews={imagePreviews}
          setImagePreviews={setImagePreviews}
          maxImages={8}
        />

        <VideoSection
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          videoPreview={videoPreview}
          setVideoPreview={setVideoPreview}
          existingVideoUrl={existingVideoUrl}
          maxVideos={1}
          fileInputRef={fileInputRef}
          isClient={isClient}
          blobUrlsRef={blobUrlsRef}
          triggerFileInput={triggerFileInput}
          onRemoveExistingVideo={handleRemoveExistingVideo}
          productId={product?.id ? String(product.id) : undefined}
        />

        <HairInfoSection formData={formData} handleChange={handleChange} />

        <DealTextSection formData={formData} handleChange={handleChange} />

        <ShippingSection
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
        />

        <TaxNoticeSection formData={formData} handleChange={handleChange} />

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center justify-center min-w-32 ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>
                  {uploadProgress > 0
                    ? `Uploading ${uploadProgress}%`
                    : "Uploading..."}
                </span>
              </div>
            ) : product ? (
              "Update Product"
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
