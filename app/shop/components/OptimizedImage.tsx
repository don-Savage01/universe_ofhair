// // components/OptimizedImage.tsx
// "use client";

// import { useState, useEffect, useRef } from "react";
// import {
//   optimizeSupabaseImage,
//   getThumbnailUrl,
//   getFullSizeUrl,
// } from "@/lib/imageOptimization";

// interface OptimizedImageProps {
//   src: string;
//   alt: string;
//   className?: string;
//   width?: number;
//   height?: number;
//   quality?: number;
//   priority?: boolean;
//   thumbnail?: boolean;
//   onClick?: () => void;
//   onError?: () => void;
// }

// export default function OptimizedImage({
//   src,
//   alt,
//   className = "",
//   width,
//   height,
//   quality = 75,
//   priority = false,
//   thumbnail = false,
//   onClick,
//   onError,
// }: OptimizedImageProps) {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [hasError, setHasError] = useState(false);
//   const [currentSrc, setCurrentSrc] = useState("");
//   const imgRef = useRef<HTMLImageElement>(null);
//   const observerRef = useRef<IntersectionObserver | null>(null);

//   // Generate optimized URL
//   useEffect(() => {
//     if (!src) return;

//     let optimizedUrl: string;

//     if (thumbnail) {
//       optimizedUrl = getThumbnailUrl(src);
//     } else if (width || height) {
//       optimizedUrl = optimizeSupabaseImage(src, { width, height, quality });
//     } else {
//       optimizedUrl = getFullSizeUrl(src);
//     }

//     // For priority images, load immediately
//     if (priority) {
//       setCurrentSrc(optimizedUrl);
//     } else {
//       // For non-priority, use intersection observer
//       setCurrentSrc(""); // Clear until visible
//     }
//   }, [src, width, height, quality, thumbnail, priority]);

//   // Lazy loading with Intersection Observer
//   useEffect(() => {
//     if (priority || !imgRef.current) return;

//     observerRef.current = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             const optimizedUrl = thumbnail
//               ? getThumbnailUrl(src)
//               : width || height
//               ? optimizeSupabaseImage(src, { width, height, quality })
//               : getFullSizeUrl(src);

//             setCurrentSrc(optimizedUrl);

//             if (observerRef.current && imgRef.current) {
//               observerRef.current.unobserve(imgRef.current);
//             }
//           }
//         });
//       },
//       {
//         rootMargin: "100px",
//         threshold: 0.01,
//       }
//     );

//     if (imgRef.current) {
//       observerRef.current.observe(imgRef.current);
//     }

//     return () => {
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//       }
//     };
//   }, [src, width, height, quality, thumbnail, priority]);

//   const handleLoad = () => {
//     setIsLoaded(true);
//     setHasError(false);
//   };

//   const handleError = () => {
//     setHasError(true);
//     setIsLoaded(false);

//     if (currentSrc !== src) {
//       setCurrentSrc(src);
//     }

//     onError?.();
//   };

//   return (
//     <div className={`relative overflow-hidden ${className}`}>
//       {/* Loading skeleton */}
//       {!isLoaded && !hasError && (
//         <div className="absolute inset-0 bg-gray-200 animate-pulse" />
//       )}

//       {/* Error placeholder */}
//       {hasError && (
//         <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
//           <svg
//             className="w-12 h-12 text-gray-300"
//             fill="currentColor"
//             viewBox="0 0 20 20"
//           >
//             <path
//               fillRule="evenodd"
//               d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
//               clipRule="evenodd"
//             />
//           </svg>
//         </div>
//       )}

//       {/* Actual image - only render if currentSrc is not empty */}
//       {currentSrc && (
//         <>
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             ref={imgRef}
//             src={currentSrc}
//             alt={alt}
//             className={`w-full h-full object-contain transition-opacity duration-300 ${
//               isLoaded ? "opacity-100" : "opacity-0"
//             }`}
//             loading={priority ? "eager" : "lazy"}
//             onLoad={handleLoad}
//             onError={handleError}
//             onClick={onClick}
//             style={{
//               width: width ? `${width}px` : "100%",
//               height: height ? `${height}px` : "100%",
//             }}
//           />

//           {/* Progressive blur effect while loading */}
//           {!isLoaded && (
//             <>
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={optimizeSupabaseImage(src, { width: 50, quality: 30 })}
//                 alt=""
//                 className="absolute inset-0 w-full h-full object-contain blur-sm scale-110"
//                 aria-hidden="true"
//               />
//             </>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// components/OptimizedImage.tsx - FIXED VERSION
"use client";

import { useState, useEffect, useRef } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  thumbnail?: boolean;
  onClick?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  quality = 75,
  priority = false,
  thumbnail = false,
  onClick,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Get the final image URL
  useEffect(() => {
    if (!src) {
      setCurrentSrc("");
      return;
    }

    // SIMPLE FIX: Just use the original URL
    // Add a cache-busting parameter to prevent stale images
    const cacheBuster = Math.floor(Date.now() / (1000 * 60 * 60)); // Change every hour
    const imageUrl = `${src}?t=${cacheBuster}`;

    setCurrentSrc(imageUrl);

    // If priority, preload the image
    if (priority) {
      const img = new Image();
      img.src = imageUrl;
    }
  }, [src, priority]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (priority || !src || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cacheBuster = Math.floor(Date.now() / (1000 * 60 * 60));
            const imageUrl = `${src}?t=${cacheBuster}`;

            setCurrentSrc(imageUrl);

            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setHasError(true);
    setIsLoaded(false);

    // Try to load without cache buster if that fails
    if (currentSrc.includes("?t=") && currentSrc !== src) {
      setCurrentSrc(src);
    }

    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Actual image */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading={priority ? "eager" : "lazy"}
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          style={{
            width: width ? `${width}px` : "100%",
            height: height ? `${height}px` : "100%",
          }}
        />
      )}
    </div>
  );
}
