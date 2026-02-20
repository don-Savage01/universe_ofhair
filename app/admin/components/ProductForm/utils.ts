import { supabase } from "@/lib/supabase";

// ✅ ADD: Import heic2any for HEIC conversion
import heic2any from "heic2any";

// Utility functions
export const formatNumberWithCommas = (value: string | number): string => {
  if (value === "" || value === undefined || value === null) return "";
  const numValue =
    typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
  if (isNaN(numValue)) return "";
  return numValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const parseCommaFormattedNumber = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "");
  return parseFloat(cleaned) || 0;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// ✅ FIXED: Calculate delivery dates (5-10 days from today)
export const calculateDeliveryDates = (): string => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() + 5); // 5 days from now
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 10); // 10 days from now

  const formatDate = (date: Date) => {
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month}. ${day}`;
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const DENSITY_MULTIPLIERS: Record<string, number> = {
  "150%": 1.0,
  "180%": 1.2,
  "200%": 1.5,
  "250%": 2.0,
  "300%": 2.5,
};

// ✅ ADD: Check if file is HEIC
export const isHeicFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  return (
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif") ||
    fileType.includes("heic") ||
    fileType.includes("heif")
  );
};

// ✅ ADD: Convert HEIC to JPEG
export const convertHeicToJpeg = async (file: File): Promise<File> => {
  try {
    const blob = (await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    })) as Blob;

    const newFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    const convertedFile = new File([blob], newFileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    return convertedFile;
  } catch (error) {
    throw new Error(
      `Failed to convert HEIC image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

// ✅ ADD: Process files with HEIC conversion
export const processFilesWithHeicConversion = async (
  files: File[],
): Promise<File[]> => {
  const processedFiles = await Promise.all(
    files.map(async (file) => {
      if (isHeicFile(file)) {
        try {
          return await convertHeicToJpeg(file);
        } catch (error) {
          // Return original file if conversion fails
          return file;
        }
      }
      return file;
    }),
  );

  return processedFiles;
};

// Image compression function
export const compressImage = async (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.85,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            if (compressedFile.size >= file.size) {
              resolve(file);
            } else {
              resolve(compressedFile);
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

// ✅ FIXED: Image cropping function with HEIC handling
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: any,
  rotation = 0,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // ✅ FIX: Check if it's a HEIC data URL
    if (
      imageSrc.startsWith("data:image/heic") ||
      imageSrc.startsWith("data:image/heif")
    ) {
      reject(
        new Error(
          "HEIC format detected in data URL. Please convert HEIC files to JPG or PNG first.",
        ),
      );
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";

    const timeoutId = setTimeout(() => {
      reject(new Error("Image loading timeout (10s)"));
    }, 10000);

    image.onload = () => {
      clearTimeout(timeoutId);

      if (!pixelCrop || pixelCrop.width <= 0 || pixelCrop.height <= 0) {
        reject(new Error("Invalid crop area"));
        return;
      }

      try {
        const canvas = document.createElement("canvas");
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height,
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas to Blob conversion failed"));
            }
          },
          "image/jpeg",
          0.92,
        );
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = (error) => {
      clearTimeout(timeoutId);

      // Provide more specific error for HEIC
      if (imageSrc.includes("heic") || imageSrc.includes("heif")) {
        reject(
          new Error(
            "HEIC images cannot be processed directly. Please convert to JPG or PNG first.",
          ),
        );
      } else {
        reject(
          new Error(
            `Failed to load image from source. Please try a different image format.`,
          ),
        );
      }
    };

    image.src = imageSrc;
  });
};

// ✅ FIXED: Image cropping function that handles HEIC files
export const getCroppedImgFromFile = async (
  file: File,
  pixelCrop: any,
  rotation = 0,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // ✅ FIX: Convert HEIC files before processing
    const processFile = async () => {
      let fileToProcess = file;

      // Convert HEIC to JPEG first
      if (isHeicFile(file)) {
        try {
          fileToProcess = await convertHeicToJpeg(file);
        } catch (conversionError) {
          reject(
            new Error(
              `Cannot process HEIC image: ${
                conversionError instanceof Error
                  ? conversionError.message
                  : "Please convert to JPG or PNG first"
              }`,
            ),
          );
          return;
        }
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const image = new Image();
        image.crossOrigin = "anonymous";

        const timeoutId = setTimeout(() => {
          reject(new Error("Image loading timeout (15s)"));
        }, 15000);

        image.onload = () => {
          clearTimeout(timeoutId);

          try {
            const canvas = document.createElement("canvas");
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("No 2d context available"));
              return;
            }

            // Clear and draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            ctx.drawImage(
              image,
              pixelCrop.x,
              pixelCrop.y,
              pixelCrop.width,
              pixelCrop.height,
              0,
              0,
              pixelCrop.width,
              pixelCrop.height,
            );

            // Create blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Canvas to Blob conversion failed"));
                }
              },
              "image/jpeg",
              0.92,
            );
          } catch (error) {
            reject(error);
          }
        };

        image.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error("Failed to load image from file"));
        };

        image.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsDataURL(fileToProcess);
    };

    processFile().catch(reject);
  });
};

// ✅ UPDATED: Validate images with better HEIC handling
export const validateImages = (files: File[]): string[] => {
  const errors: string[] = [];
  const maxSize = 20 * 1024 * 1024; // 20MB

  files.forEach((file) => {
    // Check file size
    if (file.size > maxSize) {
      errors.push(
        `${file.name}: File too large (${formatBytes(
          file.size,
        )}). Maximum size is ${formatBytes(maxSize)}`,
      );
    }

    // Check for HEIC/HEIF files (iPhone images)
    const isHeic = isHeicFile(file);

    if (isHeic) {
      // HEIC files will be automatically converted
      // Don't add error - it will be converted automatically
      return;
    }

    // Get file extension
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    // Check if file type is valid (non-HEIC)
    const hasValidExtension = validExtensions.includes(fileExt || "");

    if (!hasValidExtension && !isHeic) {
      errors.push(
        `${file.name}: Invalid file type. Use JPG, PNG, WebP, GIF, or HEIC/HEIF`,
      );
    }
  });

  return errors;
};

// ✅ FIXED: Upload images to Supabase with HEIC conversion - Now properly throws errors
export const uploadImagesToSupabase = async (
  files: File[],
): Promise<string[]> => {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    // ✅ FIX: Convert HEIC files before upload
    const processedFiles = await processFilesWithHeicConversion(files);

    const validFiles = processedFiles.filter(
      (file) => file && file.name && file.size > 0,
    );

    if (validFiles.length === 0) {
      return [];
    }

    // Use Promise.all instead of allSettled to fail fast on network errors
    const uploadPromises = validFiles.map(async (file, index) => {
      try {
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          throw error;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        return publicUrl;
      } catch (error) {
        // Re-throw to fail the whole upload
        throw error;
      }
    });

    // Use Promise.all to ensure all uploads succeed or fail together
    const uploadedUrls = await Promise.all(uploadPromises);

    return uploadedUrls;
  } catch (error) {
    // Re-throw the error so the form can catch it
    throw error;
  }
};

// ====================
// VIDEO FUNCTIONS
// ====================

// Validate video file
export const validateVideo = (file: File): string | null => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const validTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
  ];

  if (file.size > maxSize) {
    return `Video file too large (${formatBytes(
      file.size,
    )}). Maximum size is ${formatBytes(maxSize)}`;
  }

  if (
    !validTypes.includes(file.type) &&
    !file.name.match(/\.(mp4|webm|mov|avi)$/i)
  ) {
    return "Invalid video format. Use MP4, WebM, MOV, or AVI";
  }

  return null;
};

// Get video duration with improved iOS support
export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File)) {
      reject(new Error("Invalid file provided"));
      return;
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    let blobUrl: string | null = null;

    const cleanup = () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        blobUrl = null;
      }
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Video duration check timeout (10s)"));
    }, 10000);

    video.onloadeddata = () => {
      clearTimeout(timeoutId);

      if (
        video.duration === Infinity ||
        isNaN(video.duration) ||
        video.duration === 0
      ) {
        video.currentTime = 1e10;
        video.ontimeupdate = () => {
          video.ontimeupdate = null;
          const duration = video.duration;
          cleanup();
          resolve(duration);
        };
      } else {
        const duration = video.duration;
        cleanup();
        resolve(duration);
      }
    };

    video.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      reject(new Error("Could not load video metadata"));
    };

    try {
      blobUrl = URL.createObjectURL(file);
      video.src = blobUrl;
      video.load();
    } catch (error) {
      clearTimeout(timeoutId);
      cleanup();
      reject(error);
    }
  });
};

// Create a File from Blob with proper metadata
export const blobToFile = (
  blob: Blob,
  fileName: string,
  fileType: string,
): File => {
  const file = new File([blob], fileName, {
    type: fileType,
    lastModified: Date.now(),
  });

  return file;
};

// Upload video to Supabase
export const uploadVideoToSupabase = async (file: File): Promise<string> => {
  try {
    if (!(file instanceof File)) {
      throw new Error("Invalid file provided for upload");
    }

    // Validate size
    if (file.size > 50 * 1024 * 1024) {
      throw new Error(
        `Video file too large (${formatBytes(file.size)}). Maximum size is 50MB`,
      );
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const fileName = `video_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}.${fileExt}`;
    const filePath = `product-videos/${fileName}`;

    const { data, error } = await supabase.storage
      .from("media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "video/mp4",
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(filePath);

    if (!publicUrl || typeof publicUrl !== "string") {
      throw new Error("No public URL returned from Supabase");
    }

    return publicUrl;
  } catch (error) {
    throw error;
  }
};

// Delete video from Supabase
export const deleteVideoFromSupabase = async (
  videoUrl: string,
): Promise<void> => {
  if (!videoUrl || videoUrl.trim() === "") {
    return;
  }

  try {
    const urlParts = videoUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName || fileName.includes("?")) {
      return;
    }

    const filePath = fileName;

    const { error } = await supabase.storage.from("media").remove([filePath]);

    if (error) {
      return;
    }
  } catch (error) {
    // Silently fail
  }
};

// Helper functions for blob URL management
export const createSafeBlobUrl = (
  blob: Blob | File,
  cleanupTracker?: Set<string>,
): string => {
  const blobUrl = URL.createObjectURL(blob);

  if (cleanupTracker) {
    cleanupTracker.add(blobUrl);
  }

  return blobUrl;
};

export const safelyRevokeBlobUrl = (
  url: string,
  cleanupTracker?: Set<string>,
): void => {
  if (!url || !url.startsWith("blob:")) return;

  try {
    URL.revokeObjectURL(url);

    if (cleanupTracker) {
      cleanupTracker.delete(url);
    }
  } catch (error) {
    // Silently fail
  }
};

export const cleanupAllBlobUrls = (cleanupTracker: Set<string>): void => {
  if (!cleanupTracker || cleanupTracker.size === 0) return;

  cleanupTracker.forEach((url) => {
    safelyRevokeBlobUrl(url);
  });

  cleanupTracker.clear();
};

// Filter valid files - FIXED VERSION
export const filterValidFiles = (files: any[]): File[] => {
  if (!files || !Array.isArray(files)) {
    return [];
  }

  const validFiles = files.filter((file) => {
    const isValid =
      file instanceof File &&
      file.name &&
      typeof file.name === "string" &&
      file.size > 0 &&
      (file.type?.startsWith("image/") || isHeicFile(file));

    return isValid;
  }) as File[]; // Type assertion here

  return validFiles;
};
