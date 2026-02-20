"use client";

import { useRef, useState, useEffect } from "react";
import VideoTrimmer from "./VideoTrimmer";
import {
  formatBytes,
  validateVideo,
  getVideoDuration,
  blobToFile,
} from "./utils";

interface VideoSectionProps {
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  videoPreview: string | null;
  setVideoPreview: (preview: string | null) => void;
  existingVideoUrl?: string;
  maxVideos?: number;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isClient: boolean;
  blobUrlsRef: React.RefObject<Set<string>>;
  triggerFileInput: () => void;
  onRemoveExistingVideo?: () => void;
}

export default function VideoSection({
  videoFile,
  setVideoFile,
  videoPreview,
  setVideoPreview,
  existingVideoUrl,
  maxVideos = 1,
  fileInputRef,
  isClient,
  blobUrlsRef,
  triggerFileInput,
  onRemoveExistingVideo,
}: VideoSectionProps) {
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isCheckingDuration, setIsCheckingDuration] = useState(false);
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);
  const [showVideoTrimmer, setShowVideoTrimmer] = useState(false);
  const [videoToTrim, setVideoToTrim] = useState<File | null>(null);
  const [isTrimming, setIsTrimming] = useState(false);

  // ✅ Add scrollPositionRef
  const scrollPositionRef = useRef<number>(0);

  // Use a ref to store the blob URL so it persists across re-renders
  const videoBlobUrlRef = useRef<string | null>(null);

  // Create blob URL when videoFile changes
  useEffect(() => {
    if (videoFile && !videoBlobUrlRef.current) {
      const url = URL.createObjectURL(videoFile);
      videoBlobUrlRef.current = url;
      blobUrlsRef.current?.add(url);
    }

    return () => {
      // Only clean up on actual unmount, not re-renders
    };
  }, [videoFile, blobUrlsRef]);

  // Cleanup on actual unmount
  useEffect(() => {
    return () => {
      if (videoBlobUrlRef.current) {
        URL.revokeObjectURL(videoBlobUrlRef.current);
        blobUrlsRef.current?.delete(videoBlobUrlRef.current);
      }
    };
  }, [blobUrlsRef]);

  // Get the URL to use for the video element
  const getVideoUrl = () => {
    if (videoBlobUrlRef.current) {
      return videoBlobUrlRef.current;
    }
    if (videoPreview && videoPreview.startsWith("blob:")) {
      return videoPreview;
    }
    return existingVideoUrl || null;
  };

  const videoUrlToUse = getVideoUrl();

  const hasNewVideo = !!videoFile || !!videoUrlToUse;
  const hasExistingVideo = !!existingVideoUrl && !videoFile;
  const hasAnyVideo = hasNewVideo || hasExistingVideo;
  const isVideoLimitReached = hasAnyVideo && maxVideos <= 1;

  const getButtonText = () => {
    if (isVideoLimitReached) {
      return hasNewVideo ? "Replace Video" : "Video Exists - Click to Replace";
    }
    return hasAnyVideo ? "Replace Video" : "Choose Video";
  };

  // ✅ Fixed handleVideoTrimComplete
  const handleVideoTrimComplete = (trimmedBlob: Blob) => {
    if (!videoToTrim) return;

    // Show loading immediately
    setIsTrimming(true);

    // Use setTimeout to let the UI update
    setTimeout(() => {
      const originalName = videoToTrim.name;
      const baseName = originalName.replace(/\.[^/.]+$/, "");
      const trimmedFileName = `trimmed_${baseName}.mp4`;

      const trimmedFile = blobToFile(trimmedBlob, trimmedFileName, "video/mp4");

      // Create new blob URL
      const url = URL.createObjectURL(trimmedFile);

      // Clean up old URL
      if (videoBlobUrlRef.current) {
        URL.revokeObjectURL(videoBlobUrlRef.current);
        blobUrlsRef.current?.delete(videoBlobUrlRef.current);
      }

      // Update ref
      videoBlobUrlRef.current = url;
      blobUrlsRef.current?.add(url);

      // Update state
      setVideoFile(trimmedFile);
      setShowVideoTrimmer(false);
      setVideoToTrim(null);

      // Hide loading after video is ready
      setTimeout(() => {
        setIsTrimming(false);
      }, 300);

      // Restore scroll position
      window.scrollTo({
        top: scrollPositionRef.current,
        behavior: "instant",
      });
    }, 50);
  };

  const handleTrimCancel = () => {
    setShowVideoTrimmer(false);
    setVideoToTrim(null);
  };

  // ✅ UPDATED: Save scroll position when selecting video
  const handleVideoSelect = async (files: File[]) => {
    // ✅ Save current scroll position before any state changes
    scrollPositionRef.current = window.scrollY;

    const video = files[0];
    if (!video) return;

    if (files.length > 1) {
      alert("Please select only one video file per product");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Confirmation dialog when replacing existing video
    if (hasAnyVideo) {
      const replace = window.confirm(
        `This product already has ${
          hasNewVideo ? "a selected video" : "an existing video"
        }.\n\nDo you want to replace it?\n\n` +
          "Click OK to replace.\n" +
          "Click Cancel to keep the current video.",
      );

      if (!replace) {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Clean up previous blob URL
      if (videoBlobUrlRef.current) {
        URL.revokeObjectURL(videoBlobUrlRef.current);
        blobUrlsRef.current?.delete(videoBlobUrlRef.current);
        videoBlobUrlRef.current = null;
      }

      // Clear existing video state
      setVideoFile(null);
      setVideoPreview(null);

      // If replacing a database video, notify parent
      if (existingVideoUrl && !videoFile && onRemoveExistingVideo) {
        onRemoveExistingVideo();
      }
    }

    // Validate video
    const videoError = validateVideo(video);
    if (videoError) {
      alert(videoError);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Store the video temporarily while checking duration
    setPendingVideo(video);

    // Check video duration
    setIsCheckingDuration(true);
    try {
      const duration = await getVideoDuration(video);
      setIsCheckingDuration(false);

      if (duration > 60) {
        const shouldTrim = window.confirm(
          `Video is ${Math.round(
            duration,
          )} seconds (max 60 seconds). Trim it to 1 minute?`,
        );
        if (shouldTrim) {
          setVideoToTrim(video);
          setShowVideoTrimmer(true);
          setPendingVideo(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        } else {
          // User chose NOT to trim - clear everything
          setPendingVideo(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }
      }
      if (duration < 1) {
        alert("Video too short. Minimum duration is 1 second");
        setPendingVideo(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Video is within limits - set it
      setVideoFile(video);

      // Create blob URL
      const url = URL.createObjectURL(video);
      videoBlobUrlRef.current = url;
      blobUrlsRef.current?.add(url);

      setPendingVideo(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // ✅ Restore scroll position after video is loaded
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "instant",
        });
      }, 100);
    } catch (error) {
      setIsCheckingDuration(false);
      // Silently handle error - user already gets alert
      setPendingVideo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
  };

  const removeVideo = () => {
    // Clean up blob URL
    if (videoBlobUrlRef.current) {
      URL.revokeObjectURL(videoBlobUrlRef.current);
      blobUrlsRef.current?.delete(videoBlobUrlRef.current);
      videoBlobUrlRef.current = null;
    }

    setVideoFile(null);
    setVideoPreview(null);
    setPendingVideo(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (existingVideoUrl && !videoFile && onRemoveExistingVideo) {
      onRemoveExistingVideo();
    }
  };

  const clearVideoSelection = () => {
    if (videoBlobUrlRef.current) {
      URL.revokeObjectURL(videoBlobUrlRef.current);
      blobUrlsRef.current?.delete(videoBlobUrlRef.current);
      videoBlobUrlRef.current = null;
    }

    setVideoFile(null);
    setVideoPreview(null);
    setPendingVideo(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVideoLoadStart = () => {
    setIsVideoLoading(true);
  };

  const handleVideoLoaded = () => {
    setIsVideoLoading(false);
  };

  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>,
  ) => {
    setIsVideoLoading(false);
    // Silently handle error
  };

  return (
    <>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center">
        <div className="space-y-4">
          <svg
            className="mx-auto h-12 md:h-16 w-12 md:w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>

          <div>
            <div className="flex items-center justify-center mb-2">
              <p className="text-lg font-medium text-gray-700">Select Video</p>
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {maxVideos} video{maxVideos > 1 ? "s" : ""} max
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Upload a product demonstration video (max 1 minute, 50MB)
            </p>

            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isVideoLimitReached && !hasNewVideo}
              className={`w-full px-6 py-3 font-medium rounded-lg transition-colors ${
                isVideoLimitReached && !hasNewVideo
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {isCheckingDuration ? "Checking duration..." : getButtonText()}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleVideoSelect(files);
                }
                if (e.target) {
                  e.target.value = "";
                }
              }}
              className="hidden"
              disabled={isVideoLimitReached && !hasNewVideo}
            />
          </div>

          <div className="flex items-center justify-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                hasAnyVideo ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
            <p className="text-xs text-gray-400">
              {hasAnyVideo
                ? `${
                    hasNewVideo ? "New video selected" : "Existing video"
                  } (${maxVideos} max)`
                : `No video uploaded (${maxVideos} max)`}
            </p>
          </div>

          {hasNewVideo && (
            <div className="pt-2">
              <button
                type="button"
                onClick={clearVideoSelection}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </div>

      {hasAnyVideo && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-700">Video Preview</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {maxVideos === 1 ? "1 video max" : `${maxVideos} videos max`}
            </span>
          </div>
          <div className="relative">
            {(isVideoLoading || isCheckingDuration) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin mb-2 mx-auto" />
                  <p className="text-sm text-gray-500">
                    {isCheckingDuration
                      ? "Checking duration..."
                      : "Loading video..."}
                  </p>
                </div>
              </div>
            )}

            <div className="relative rounded-lg overflow-hidden bg-black">
              {videoUrlToUse && (
                <video
                  src={videoUrlToUse}
                  controls
                  className="w-full max-w-2xl rounded-lg shadow-lg mobile-video"
                  preload="metadata"
                  playsInline
                  webkit-playsinline="true"
                  controlsList="nodownload"
                  onLoadStart={handleVideoLoadStart}
                  onLoadedData={handleVideoLoaded}
                  onError={handleVideoError}
                >
                  Your browser does not support the video tag.
                </video>
              )}

              {/* Loading overlay - moved inside the video container */}
              {isTrimming && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg z-20">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-purple-500 rounded-full animate-spin mb-2 mx-auto" />
                    <p className="text-sm text-white font-medium">
                      Loading trimmed video...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute top-2 right-2 flex space-x-2">
              {videoFile && videoFile.size > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    // Save scroll position
                    scrollPositionRef.current = window.scrollY;
                    setVideoToTrim(videoFile);
                    setShowVideoTrimmer(true);
                  }}
                  className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                  aria-label="Trim video"
                  title="Trim video"
                >
                  ✂️
                </button>
              )}
              <button
                type="button"
                onClick={removeVideo}
                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                aria-label="Remove video"
                title="Remove video"
              >
                ×
              </button>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            <p>
              {videoFile
                ? `New file: ${videoFile.name}`
                : existingVideoUrl
                  ? "Existing video"
                  : ""}
            </p>
            {videoFile && (
              <>
                <p>Size: {formatBytes(videoFile.size)}</p>
                <p>Type: {videoFile.type}</p>
              </>
            )}
            {existingVideoUrl && !videoFile && (
              <p className="text-blue-600">
                <strong>Note:</strong> This is an existing video. Select a new
                file to replace it.
              </p>
            )}
          </div>
        </div>
      )}

      {showVideoTrimmer && videoToTrim && (
        <VideoTrimmer
          videoFile={videoToTrim}
          onTrimComplete={handleVideoTrimComplete}
          onCancel={handleTrimCancel}
        />
      )}
    </>
  );
}
