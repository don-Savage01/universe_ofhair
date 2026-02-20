"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  showThumbnails?: boolean;
  inStock?: boolean;
  autoSlideInterval?: number;
  enableSwipe?: boolean;
  videoUrl?: string;
  onVideoRemove?: () => void;
}

// Optimized Image Component
interface SimpleImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  thumbnail?: boolean;
}

function SimpleImage({
  src,
  alt,
  width = 1200,
  height = 1200,
  className = "",
  priority = false,
  thumbnail = false,
}: SimpleImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const shimmerRef = useRef<HTMLDivElement>(null);

  // Handle image fallback
  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);

    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [src]);

  // Check if it's a Supabase URL
  const isSupabaseUrl = src?.includes("supabase.co") || false;

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 overflow-hidden">
          {/* iPhone-compatible shimmer */}
          <div ref={shimmerRef} className="iphone-shimmer" />
        </div>
      )}

      <div
        className={`relative w-full h-full ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
      >
        <Image
          src={imageSrc}
          alt={alt}
          width={thumbnail ? 100 : width}
          height={thumbnail ? 100 : height}
          className={`${className} w-full h-full ${
            thumbnail ? "object-cover" : "object-contain"
          }`}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          quality={isSupabaseUrl ? undefined : thumbnail ? 70 : 85}
          sizes={
            thumbnail
              ? "100px"
              : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          }
          onLoad={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          unoptimized={isSupabaseUrl}
          crossOrigin="anonymous"
        />
      </div>

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-2"
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
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      )}

      {/* iPhone-specific CSS with all vendor prefixes */}
      <style jsx>{`
        .iphone-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 25%,
            rgba(209, 213, 219, 0.8) 50%,
            transparent 75%
          );
          background-size: 200% 100%;

          /* Standard animation */
          animation: shimmer 1.5s infinite linear;

          /* iOS Safari specific optimizations */
          -webkit-animation: shimmer 1.5s infinite linear;
          -webkit-transform: translate3d(0, 0, 0);
          transform: translate3d(0, 0, 0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-perspective: 1000;
          perspective: 1000;
          will-change: background-position;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* iOS Safari vendor-prefixed keyframes */
        @-webkit-keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Force hardware acceleration for iOS */
        @media not all and (min-resolution: 0.001dpcm) {
          @supports (-webkit-appearance: none) {
            .iphone-shimmer {
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
            }
          }
        }
      `}</style>
    </div>
  );
}

// MAIN COMPONENT - EVERYTHING BELOW STAYS EXACTLY THE SAME
export default function ProductImageGallery({
  images: imagesProp,
  productName,
  showThumbnails = true,
  inStock = true,
  autoSlideInterval = 4000,
  enableSwipe = true,
  videoUrl,
  onVideoRemove,
}: ProductImageGalleryProps) {
  // Filter out null/undefined images
  const images = useMemo(
    () => (imagesProp || []).filter((img) => img && img.trim() !== ""),
    [imagesProp],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [videoEnded, setVideoEnded] = useState(false);

  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);

  // Build media array - video is always at position 0 if it exists
  const allMedia = useMemo(() => {
    const media = [...images];
    if (videoUrl) {
      media.unshift(videoUrl);
    }
    return media;
  }, [images, videoUrl]);

  // Check if current index is video
  const isCurrentVideo = useMemo(() => {
    return videoUrl && currentIndex === 0;
  }, [videoUrl, currentIndex]);

  // ✅ FIXED: Reset video ended state when video changes
  useEffect(() => {
    setVideoEnded(false);
  }, [videoUrl]);

  // ✅ FIXED: Clean up autoplay properly
  useEffect(() => {
    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
        autoSlideRef.current = null;
      }
    };
  }, []);

  // ✅ FIXED: Handle autoplay with video considerations
  const startAutoSlide = useCallback(() => {
    // Don't start autoplay if:
    // 1. Only one item
    // 2. Current is video AND video hasn't ended
    // 3. User paused autoplay
    if (allMedia.length <= 1 || !isAutoPlaying) return;

    // If current is video, only start autoplay after video ends
    if (isCurrentVideo && !videoEnded) return;

    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }

    autoSlideRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
    }, autoSlideInterval);
  }, [
    allMedia.length,
    autoSlideInterval,
    isCurrentVideo,
    videoEnded,
    isAutoPlaying,
  ]);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  }, []);

  // ✅ FIXED: Manage autoplay based on conditions
  useEffect(() => {
    if (isAutoPlaying) {
      startAutoSlide();
    } else {
      stopAutoSlide();
    }

    return () => {
      stopAutoSlide();
    };
  }, [isAutoPlaying, startAutoSlide, stopAutoSlide]);

  const handleNext = useCallback(() => {
    if (allMedia.length <= 1) return;

    setCurrentIndex((prev) => {
      // If we're on video (index 0) and it hasn't ended, stay on it
      if (prev === 0 && videoUrl && !videoEnded) return prev;

      return prev === allMedia.length - 1 ? 0 : prev + 1;
    });

    // Reset progress
    setProgress(0);

    if (isAutoPlaying) {
      stopAutoSlide();
      startAutoSlide();
    }
  }, [
    allMedia.length,
    isAutoPlaying,
    startAutoSlide,
    stopAutoSlide,
    videoUrl,
    videoEnded,
  ]);

  const handlePrev = useCallback(() => {
    if (allMedia.length <= 1) return;

    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
    setProgress(0);

    if (isAutoPlaying) {
      stopAutoSlide();
      startAutoSlide();
    }
  }, [allMedia.length, isAutoPlaying, startAutoSlide, stopAutoSlide]);

  // ✅ FIXED: Handle video events properly
  const handleVideoEnded = useCallback(() => {
    setVideoEnded(true);

    // If video ended and we have more media, advance to next
    if (allMedia.length > 1 && isAutoPlaying) {
      // Wait a moment then go to next image
      setTimeout(() => {
        setCurrentIndex(1); // Go directly to first image after video
        setProgress(0);
        startAutoSlide(); // Restart autoplay for images
      }, 1000);
    }
  }, [allMedia.length, isAutoPlaying, startAutoSlide]);

  const handleVideoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    stopAutoSlide();
    setVideoEnded(false);
  }, [stopAutoSlide]);

  const handleVideoPause = useCallback(() => {
    // Don't restart autoplay if video is just paused
    // Only restart if video ended or user manually paused
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe || allMedia.length <= 1) return;
    setTouchStartX(e.touches[0].clientX);
    stopAutoSlide();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!enableSwipe || allMedia.length <= 1 || touchStartX === null) {
      if (isAutoPlaying) startAutoSlide();
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    setTouchStartX(null);
    if (isAutoPlaying) startAutoSlide();
  };

  const handleThumbnailClick = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      setProgress(0);

      // If clicking on video, mark video as not ended
      if (index === 0 && videoUrl) {
        setVideoEnded(false);
      }

      if (isAutoPlaying) {
        stopAutoSlide();
        startAutoSlide();
      }
    },
    [isAutoPlaying, startAutoSlide, stopAutoSlide, videoUrl],
  );

  const handleMouseEnter = () => {
    if (allMedia.length > 1) {
      setIsAutoPlaying(false);
      stopAutoSlide();
    }
  };

  const handleMouseLeave = () => {
    if (allMedia.length > 1) {
      setIsAutoPlaying(true);
      startAutoSlide();
    }
  };

  // ✅ FIXED: Progress bar logic - only for images, not videos
  useEffect(() => {
    if (!isAutoPlaying || allMedia.length <= 1 || isCurrentVideo) {
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 100 / (autoSlideInterval / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAutoPlaying, allMedia.length, autoSlideInterval, isCurrentVideo]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const checkIsVideo = (media: string) => {
    if (!media) return false;
    const mediaLower = media.toLowerCase();
    return (
      mediaLower.endsWith(".mp4") ||
      mediaLower.endsWith(".webm") ||
      mediaLower.endsWith(".mov") ||
      mediaLower.endsWith(".avi") ||
      mediaLower.endsWith(".mkv")
    );
  };

  // ✅ FIXED: Video player with proper event handlers
  const VideoPlayer = useMemo(() => {
    if (!isCurrentVideo || !videoUrl) return null;

    return (
      <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
        <video
          ref={videoElementRef}
          controls
          className="max-w-full max-h-full object-contain"
          preload="metadata"
          playsInline
          controlsList="nodownload"
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onEnded={handleVideoEnded}
          onError={(e) => {
            // If video fails to load, skip to images
            if (allMedia.length > 1) {
              setTimeout(() => {
                setCurrentIndex(1);
                startAutoSlide();
              }, 1000);
            }
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/quicktime" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }, [
    isCurrentVideo,
    videoUrl,
    handleVideoPlay,
    handleVideoPause,
    handleVideoEnded,
    allMedia.length,
    startAutoSlide,
  ]);

  if (allMedia.length === 0) {
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <svg
            className="w-32 h-32 mx-auto text-gray-400 mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-gray-500 text-lg">No media available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full mb-4">
        <div
          className="relative w-full aspect-square overflow-hidden rounded-lg bg-linear-to-br from-pink-50 via-gray-100 to-pink-50 drop-shadow-lg flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {isCurrentVideo ? (
              VideoPlayer
            ) : (
              <SimpleImage
                src={allMedia[currentIndex]}
                alt={`${productName} - View ${currentIndex + 1}`}
                width={800}
                height={800}
                priority={currentIndex === 0}
                className={`max-w-full max-h-full p-4 transition-opacity duration-300 ${
                  !inStock ? "filter grayscale blur-[0.4px]" : ""
                }`}
              />
            )}
          </div>
        </div>

        {/* Progress Dots */}
        {allMedia.length > 1 && (
          <div className="mt-4">
            <div className="flex justify-center gap-1.5">
              {allMedia.map((_, index) => {
                const isVideo = index === 0 && videoUrl;
                const isActive = currentIndex === index;

                return (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className="relative focus:outline-none group"
                    aria-label={`Go to ${isVideo ? "video" : "image"} ${
                      index + 1
                    }`}
                  >
                    <div
                      className={`w-6 h-0.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-pink-500 scale-110"
                          : "bg-gray-300 group-hover:bg-gray-400"
                      }`}
                    >
                      {isActive && isAutoPlaying && !isVideo && (
                        <div
                          className="h-full bg-pink-200 rounded-full transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && allMedia.length > 1 && (
        <div className="relative w-full mt-2">
          <div
            ref={thumbnailsRef}
            className="flex gap-3 pb-2 overflow-x-auto no-scrollbar snap-x snap-mandatory"
          >
            {allMedia.map((media, index) => {
              const isVideo = index === 0 && videoUrl;
              const isActive = currentIndex === index;

              return (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all snap-center ml-1 mt-1 relative ${
                    isActive
                      ? "border-pink-500 scale-105 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  aria-label={`View ${isVideo ? "video" : "image"} ${
                    index + 1
                  }`}
                >
                  {isVideo ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  ) : (
                    <SimpleImage
                      src={media}
                      alt={`${productName} thumbnail ${index + 1}`}
                      width={100}
                      height={100}
                      thumbnail={true}
                      priority={index <= 3}
                      className="w-full h-full rounded-sm"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
