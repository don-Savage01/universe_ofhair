/**
 * Utility functions for handling image and file uploads
 */

// Read file as data URL (permanent, not temporary like blob URL)
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Read file as blob URL (temporary, needs cleanup)
export const readFileAsBlobURL = (file: File): string => {
  return URL.createObjectURL(file);
};

// Clean up blob URL
export const revokeBlobURL = (url: string): void => {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

// Check if URL is a blob URL
export const isBlobURL = (url: string): boolean => {
  return url.startsWith("blob:");
};

// Check if URL is a data URL
export const isDataURL = (url: string): boolean => {
  return url.startsWith("data:");
};

// Convert FileList to array of Files
export const fileListToArray = (fileList: FileList | null): File[] => {
  return fileList ? Array.from(fileList) : [];
};

// Filter valid image files
export const filterValidImageFiles = (files: File[]): File[] => {
  return files.filter((file) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      console.warn(`Skipping non-image file: ${file.name}`);
      return false;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.warn(`Image too large (${file.size} bytes): ${file.name}`);
      return false;
    }

    return true;
  });
};

// Filter valid video files
export const filterValidVideoFiles = (files: File[]): File[] => {
  return files.filter((file) => {
    // Check file type
    if (!file.type.startsWith("video/")) {
      console.warn(`Skipping non-video file: ${file.name}`);
      return false;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      console.warn(`Video too large (${file.size} bytes): ${file.name}`);
      return false;
    }

    return true;
  });
};

// Convert multiple files to data URLs
export const filesToDataURLs = async (files: File[]): Promise<string[]> => {
  const dataUrls = await Promise.all(
    files.map((file) => readFileAsDataURL(file))
  );
  return dataUrls;
};

// Clean up multiple blob URLs
export const revokeBlobURLs = (urls: string[]): void => {
  urls.forEach((url) => {
    if (isBlobURL(url)) {
      URL.revokeObjectURL(url);
    }
  });
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

// Check if file is an image by extension
export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
};

// Check if file is a video by extension
export const isVideoFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ["mp4", "webm", "mov", "avi", "mkv"].includes(ext);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
};
