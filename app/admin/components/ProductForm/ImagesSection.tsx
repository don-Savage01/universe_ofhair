"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import {
  compressImage,
  validateImages,
  formatBytes,
  getCroppedImg,
  getCroppedImgFromFile,
  convertHeicToJpeg,
  isHeicFile,
} from "./utils";

interface ImagesSectionProps {
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  imagePreviews: string[];
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  maxImages?: number;
}

interface CropState {
  crop: { x: number; y: number };
  zoom: number;
  aspect: number | undefined;
}

interface ImageToCrop {
  file: File;
  preview: string;
  id: string;
  name: string;
  size: number;
}

// Helper function to create data URL from file
const createDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ImagesSection({
  imageFiles,
  setImageFiles,
  imagePreviews,
  setImagePreviews,
  maxImages = 8,
}: ImagesSectionProps) {
  const [imagesToCrop, setImagesToCrop] = useState<ImageToCrop[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(0);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [cropState, setCropState] = useState<CropState>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 4 / 3,
  });
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [cropError, setCropError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);
  const blobUrlsRef = useRef<Set<string>>(new Set());
  const dataUrlsRef = useRef<Set<string>>(new Set());
  const isImageLimitReached = imagePreviews.length >= maxImages;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up blob URLs
      blobUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Silently fail
        }
      });
      blobUrlsRef.current.clear();

      // Note: Data URLs don't need cleanup as they are base64 encoded strings
      // but we clear the ref to avoid memory leaks
      dataUrlsRef.current.clear();
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      setTouchStart({ x: distance, y: 0 });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );

      const zoomChange = distance / touchStart.x;
      const newZoom = Math.max(1, Math.min(3, cropState.zoom * zoomChange));

      if (newZoom !== cropState.zoom) {
        setCropState((prev) => ({ ...prev, zoom: newZoom }));
        setTouchStart({ x: distance, y: 0 });
      }
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".bmp"] },
    onDrop: handleDrop,
    multiple: true,
    noClick: showCropModal,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleDrop(files);
    }
  };

  const triggerFileInput = () => {
    if (isClient && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  async function handleDrop(files: File[]) {
    const totalAfterUpload = imagePreviews.length + files.length;
    if (totalAfterUpload > maxImages) {
      const availableSlots = maxImages - imagePreviews.length;
      alert(
        `You can only upload ${maxImages} images maximum. You already have ${imagePreviews.length} images, so you can only add ${availableSlots} more.`,
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploadErrors([]);

    // Process HEIC files first
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        if (isHeicFile(file)) {
          try {
            const convertedFile = await convertHeicToJpeg(file);
            return convertedFile;
          } catch (conversionError) {
            // Return original if conversion fails - validation will catch it
            return file;
          }
        }
        return file;
      }),
    );

    const errors = validateImages(processedFiles);

    if (errors.length > 0) {
      setUploadErrors(errors);
      if (errors.length <= 3) {
        errors.forEach((error) => alert(error));
      } else {
        alert(`Found ${errors.length} validation errors.`);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Create data URLs for the images (NOT blob URLs)
    const newImagesToCrop: ImageToCrop[] = await Promise.all(
      processedFiles.map(async (file) => {
        const dataUrl = await createDataURL(file);
        dataUrlsRef.current.add(dataUrl);
        return {
          file,
          preview: dataUrl, // Use data URL instead of blob URL
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
        };
      }),
    );

    setImagesToCrop((prev) => [...prev, ...newImagesToCrop]);

    // FIXED: Only show crop modal if not already showing
    if (!showCropModal && newImagesToCrop.length > 0) {
      setShowCropModal(true);
      // Set current index to the first new image
      setCurrentCropIndex(imagesToCrop.length);
      setCropState({
        crop: { x: 0, y: 0 },
        zoom: 1,
        aspect: 4 / 3,
      });
      setCroppedAreaPixels(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const goToPreviousImage = () => {
    if (currentCropIndex > 0) {
      setCurrentCropIndex(currentCropIndex - 1);
      setCropState({
        crop: { x: 0, y: 0 },
        zoom: 1,
        aspect: cropState.aspect,
      });
      setCroppedAreaPixels(null);
    }
  };

  const ensureValidPreviewUrl = (image: ImageToCrop): Promise<string> => {
    // For data URLs, they're always valid
    if (image.preview && image.preview.startsWith("data:")) {
      return Promise.resolve(image.preview);
    }

    // If it's a blob URL, convert it to data URL
    if (image.preview && image.preview.startsWith("blob:")) {
      return new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            resolve(dataUrl);
          } else {
            resolve(image.preview); // Fallback
          }
        };
        img.onerror = () => {
          resolve(image.preview); // Fallback
        };
        img.src = image.preview;
      });
    }

    // For other cases, create a new data URL
    return createDataURL(image.file);
  };

  // Remove image from crop queue
  const removeFromQueue = (index: number) => {
    const imageToRemove = imagesToCrop[index];

    // Clean up if it's a blob URL
    if (imageToRemove.preview && imageToRemove.preview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imageToRemove.preview);
        blobUrlsRef.current.delete(imageToRemove.preview);
      } catch (e) {
        // Silently fail
      }
    }

    // Remove from data URLs ref if it exists
    if (dataUrlsRef.current.has(imageToRemove.preview)) {
      dataUrlsRef.current.delete(imageToRemove.preview);
    }

    // Remove image from queue
    const newQueue = imagesToCrop.filter((_, i) => i !== index);
    setImagesToCrop(newQueue);

    // Handle current crop index
    if (newQueue.length === 0) {
      // No images left - close modal
      setShowCropModal(false);
      setCurrentCropIndex(0);
    } else {
      // Calculate new current index
      let newIndex = currentCropIndex;

      if (index < currentCropIndex) {
        // Removed image is before current - move back one
        newIndex = currentCropIndex - 1;
      } else if (index === currentCropIndex) {
        // Removed the current image
        if (currentCropIndex >= newQueue.length) {
          // Was at the end - go to new last image
          newIndex = newQueue.length - 1;
        }
        // If not at the end, stay at same index (shows next image)
      }

      // Ensure index is within bounds
      newIndex = Math.max(0, Math.min(newIndex, newQueue.length - 1));
      setCurrentCropIndex(newIndex);
    }

    // Reset crop UI
    setCropState({
      crop: { x: 0, y: 0 },
      zoom: 1,
      aspect: cropState.aspect || 4 / 3,
    });
    setCroppedAreaPixels(null);
  };

  // Handle crop and save with fallback
  const handleCropAndSave = async () => {
    if (imagesToCrop.length === 0) {
      alert("Please wait for images to load");
      return;
    }

    const currentImage = imagesToCrop[currentCropIndex];
    if (!croppedAreaPixels) {
      alert("Please select a crop area first");
      return;
    }

    setCropError(null); // Clear previous errors

    try {
      // FIRST TRY: Use File-based cropping (more reliable)
      let croppedBlob: Blob;
      try {
        croppedBlob = await getCroppedImgFromFile(
          currentImage.file,
          croppedAreaPixels,
          0,
        );
      } catch (fileError) {
        // FALLBACK: Use URL-based cropping
        try {
          const previewUrl = await ensureValidPreviewUrl(currentImage);
          croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels, 0);
        } catch (urlError) {
          throw new Error(
            `Failed to crop image. Please try with a different image format (JPG or PNG).`,
          );
        }
      }

      const croppedFile = new File(
        [croppedBlob],
        `cropped_${currentImage.file.name.replace(/\.[^/.]+$/, "")}.jpg`,
        { type: "image/jpeg" },
      );

      // Compress if needed
      let finalFile = croppedFile;
      if (croppedFile.size > 5 * 1024 * 1024) {
        finalFile = await compressImage(croppedFile, 1200, 0.65);
      } else if (croppedFile.size > 2 * 1024 * 1024) {
        finalFile = await compressImage(croppedFile, 1500, 0.75);
      } else if (croppedFile.size > 500 * 1024) {
        finalFile = await compressImage(croppedFile, 1800, 0.85);
      }

      // Add to final images
      const finalDataUrl = await createDataURL(finalFile);
      dataUrlsRef.current.add(finalDataUrl);

      // Append new images to the end
      setImageFiles((prev) => [...prev, finalFile]);
      setImagePreviews((prev) => [...prev, finalDataUrl]);

      // Remove the current image from the queue
      const updatedQueue = imagesToCrop.filter(
        (_, i) => i !== currentCropIndex,
      );
      setImagesToCrop(updatedQueue);

      if (updatedQueue.length === 0) {
        // No more images - clean up and close modal
        setShowCropModal(false);
        setCurrentCropIndex(0);
      } else {
        // More images to crop
        const newIndex = Math.min(currentCropIndex, updatedQueue.length - 1);
        setCurrentCropIndex(newIndex);
        setCropState({
          crop: { x: 0, y: 0 },
          zoom: 1,
          aspect: cropState.aspect,
        });
        setCroppedAreaPixels(null);
      }
    } catch (error) {
      setCropError(error instanceof Error ? error.message : "Unknown error");

      // Show user-friendly error
      alert(
        `Failed to crop "${currentImage.name}".\n\n` +
          `This might be due to:\n` +
          `1. Image format issues (try JPG or PNG)\n` +
          `2. Image corruption\n` +
          `3. Browser limitations\n\n` +
          `Error: ${error instanceof Error ? error.message : "Unknown"}`,
      );
    }
  };

  // Remove image from final list
  const removeImage = (index: number) => {
    // Create copies of arrays before modification
    const newImagePreviews = [...imagePreviews];
    const newImageFiles = [...imageFiles];

    // Get the preview URL to clean up
    const previewUrl = newImagePreviews[index];

    // If it's a blob URL, revoke it
    if (previewUrl && previewUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(previewUrl);
        blobUrlsRef.current.delete(previewUrl);
      } catch (e) {
        // Silently fail
      }
    }

    // Remove from data URLs ref
    if (dataUrlsRef.current.has(previewUrl)) {
      dataUrlsRef.current.delete(previewUrl);
    }

    // Remove from both arrays
    newImagePreviews.splice(index, 1);
    newImageFiles.splice(index, 1);

    // Update state with new arrays
    setImagePreviews(newImagePreviews);
    setImageFiles(newImageFiles);

    // Handle thumbnail index
    if (index === thumbnailIndex) {
      setThumbnailIndex(0);
    } else if (index < thumbnailIndex) {
      setThumbnailIndex(thumbnailIndex - 1);
    }
  };

  // FIXED: Set as thumbnail by moving it to the beginning
  // FIXED: Set as thumbnail by moving it to the beginning
  const setAsThumbnail = (index: number) => {
    // Don't do anything if it's already the first image
    if (index === 0) return;

    // Create copies to avoid mutating state directly
    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];

    // Remove the selected thumbnail from its current position
    const [thumbnailFile] = newImageFiles.splice(index, 1);
    const [thumbnailPreview] = newImagePreviews.splice(index, 1);

    // Insert it at the beginning
    newImageFiles.unshift(thumbnailFile);
    newImagePreviews.unshift(thumbnailPreview);

    // Update state with new order
    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);

    // Set thumbnail index to 0 since it's now first
    setThumbnailIndex(0);
  };

  const handleAspectRatioChange = (aspect: number | undefined) => {
    let zoom = 1;
    if (aspect === 1) zoom = 1;
    else if (aspect === 4 / 3) zoom = 1.15;
    else if (aspect === 16 / 9) zoom = 1.25;

    setCropState((prev) => ({
      ...prev,
      aspect,
      zoom,
      crop: { x: 0, y: 0 },
    }));
    setCroppedAreaPixels(null);
  };

  const getCurrentImage = () => {
    if (!imagesToCrop[currentCropIndex]) return null;
    return imagesToCrop[currentCropIndex];
  };

  const currentImage = getCurrentImage();

  return (
    <div className="space-y-6">
      {cropError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="text-red-800 font-medium mb-2">Crop Error:</h4>
          <p className="text-sm text-red-700">{cropError}</p>
          <button
            onClick={() => setCropError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Product Images</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Maximum {maxImages} images
        </span>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center">
        <div className="space-y-4">
          <svg
            className="mx-auto h-12 md:h-16 w-12 md:w-16 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div>
            <div className="flex items-center justify-center mb-2">
              <p className="text-lg font-medium text-gray-700">Select Images</p>
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {maxImages} images max
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Upload multiple images. Click the star to set as thumbnail. First
              image will be the main thumbnail.
            </p>

            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isImageLimitReached}
              className={`w-full px-6 py-3 font-medium rounded-lg transition-colors ${
                isImageLimitReached
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isImageLimitReached ? "Image Limit Reached" : "Choose Images"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isImageLimitReached}
            />
          </div>

          <div className="flex items-center justify-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                imagePreviews.length > 0
                  ? "bg-green-500"
                  : imagePreviews.length === 0
                    ? "bg-gray-300"
                    : "bg-yellow-500"
              }`}
            ></div>
            <p className="text-xs text-gray-400">
              {imagePreviews.length}/{maxImages} images uploaded
            </p>
          </div>
        </div>
      </div>

      {uploadErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Upload Errors:</h4>
          <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
            {uploadErrors.slice(0, 5).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
            {uploadErrors.length > 5 && (
              <li className="text-red-600">
                ... and {uploadErrors.length - 5} more errors
              </li>
            )}
          </ul>
        </div>
      )}

      {imagePreviews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-700">
              Uploaded Images ({imagePreviews.length}/{maxImages})
            </h4>
            {thumbnailIndex >= 0 && (
              <div className="text-sm text-gray-500 bg-yellow-50 px-3 py-1 rounded-lg">
                <span className="font-medium">Thumbnail:</span> Image{" "}
                {thumbnailIndex + 1} ★
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={`preview-${index}`} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    // Silently handle error
                  }}
                />

                <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>

                <button
                  type="button"
                  onClick={() => setAsThumbnail(index)}
                  className={`absolute top-1 left-1 rounded-full w-7 h-7 flex items-center justify-center transition-colors shadow-lg ${
                    index === 0
                      ? "bg-yellow-500 text-white"
                      : "bg-white/80 text-gray-700 hover:bg-yellow-100 hover:text-yellow-600"
                  }`}
                  aria-label="Set as thumbnail"
                  title="Set as thumbnail"
                >
                  {index === 0 ? "★" : "☆"}
                </button>

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute bottom-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  aria-label="Remove image"
                  title="Remove image"
                >
                  ×
                </button>

                {index === 0 && (
                  <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-white text-xs text-center py-1 rounded-t-lg">
                    Thumbnail
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>How to set the thumbnail:</strong>
            </p>
            <ol className="text-xs text-gray-500 list-decimal pl-5 mt-1 space-y-1">
              <li>Click the star (☆) on any image to set it as thumbnail</li>
              <li>The thumbnail will automatically move to position #1</li>
              <li>Click (×) to remove an image</li>
              <li>First image in the list is the main thumbnail</li>
              <li>Maximum {maxImages} images allowed</li>
            </ol>
          </div>
        </div>
      )}

      {showCropModal && imagesToCrop.length > 0 && currentImage && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="h-screen flex flex-col">
            <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-black/70 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={goToPreviousImage}
                    disabled={currentCropIndex === 0}
                    className={`px-3 py-1 text-sm font-medium rounded-lg flex items-center space-x-2 ${
                      currentCropIndex === 0
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                    aria-label="Previous image"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Previous</span>
                  </button>

                  <div className="text-sm text-white">
                    <span className="font-medium">
                      {currentCropIndex + 1}/{imagesToCrop.length}
                    </span>
                    <span className="text-gray-300 mx-2">•</span>
                    <span className="text-gray-300 truncate max-w-[40vw] inline-block align-middle text-xs">
                      {currentImage.name}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Cancel cropping all images?")) {
                      // Clean up all previews
                      imagesToCrop.forEach((img) => {
                        if (img.preview.startsWith("blob:")) {
                          try {
                            URL.revokeObjectURL(img.preview);
                            blobUrlsRef.current.delete(img.preview);
                          } catch (e) {
                            // Silently fail
                          }
                        }
                      });
                      setImagesToCrop([]);
                      setShowCropModal(false);
                    }
                  }}
                  className="text-white hover:text-gray-300 text-xl p-1"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div
              className="flex-1 bg-black relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {isImageLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white">Loading image...</div>
                </div>
              ) : (
                <Cropper
                  key={`cropper-${currentCropIndex}-${currentImage.id}`}
                  image={currentImage.preview}
                  crop={cropState.crop}
                  zoom={cropState.zoom}
                  aspect={cropState.aspect}
                  onCropChange={(crop) =>
                    setCropState((prev) => ({ ...prev, crop }))
                  }
                  onZoomChange={(zoom) =>
                    setCropState((prev) => ({ ...prev, zoom }))
                  }
                  onCropComplete={onCropComplete}
                  restrictPosition={false}
                  zoomWithScroll={false}
                  minZoom={1}
                  maxZoom={3}
                  cropShape="rect"
                  showGrid={false}
                  objectFit="contain"
                  style={{
                    containerStyle: {
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                    },
                    cropAreaStyle: {
                      border: "2px solid rgba(255,255,255,0.8)",
                      boxShadow: "0 0 0 9999px rgba(0,0,0,0.7)",
                    },
                  }}
                  onMediaLoaded={() => {
                    setIsImageLoading(false);
                  }}
                />
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm p-4">
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleAspectRatioChange(1)}
                  className={`px-3 py-2 text-xs rounded-lg ${
                    cropState.aspect === 1
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Square
                </button>
                <button
                  type="button"
                  onClick={() => handleAspectRatioChange(4 / 3)}
                  className={`px-3 py-2 text-xs rounded-lg ${
                    cropState.aspect === 4 / 3
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  4:3
                </button>
                <button
                  type="button"
                  onClick={() => handleAspectRatioChange(16 / 9)}
                  className={`px-3 py-2 text-xs rounded-lg ${
                    cropState.aspect === 16 / 9
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  16:9
                </button>
                <button
                  type="button"
                  onClick={() => handleAspectRatioChange(undefined)}
                  className={`px-3 py-2 text-xs rounded-lg ${
                    cropState.aspect === undefined
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Free
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Remove "${currentImage.name}" from cropping?`,
                      )
                    ) {
                      removeFromQueue(currentCropIndex);
                    }
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600/80 rounded-lg hover:bg-red-700/90 active:bg-red-800 backdrop-blur-sm"
                >
                  Skip This Image
                </button>
                <button
                  type="button"
                  onClick={handleCropAndSave}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600/80 rounded-lg hover:bg-blue-700/90 active:bg-blue-800 backdrop-blur-sm"
                >
                  {currentCropIndex === imagesToCrop.length - 1
                    ? "Save & Finish"
                    : "Save & Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
