"use client";
import { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

interface VideoTrimmerProps {
  videoFile: File;
  onTrimComplete: (trimmedBlob: Blob) => void;
  onCancel: () => void;
}

export default function VideoTrimmer({
  videoFile,
  onTrimComplete,
  onCancel,
}: VideoTrimmerProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoadError, setFfmpegLoadError] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("first");
  const [trimProgress, setTrimProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Lock body scroll when trimmer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    const loadFFmpeg = async () => {
      try {
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        await ffmpeg.load({
          coreURL: `${baseURL}/ffmpeg-core.js`,
          wasmURL: `${baseURL}/ffmpeg-core.wasm`,
        });

        if (mounted) {
          setFfmpegLoaded(true);
        }
      } catch (error) {
        if (mounted) {
          setFfmpegLoadError("Failed to load video processor");
        }
      }
    };

    loadFFmpeg();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [videoFile]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);
      setStartTime(0);
      setEndTime(Math.min(60, duration));
      setSelectedSegment("first");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSegmentSelect = (segment: string) => {
    setSelectedSegment(segment);
    switch (segment) {
      case "first":
        setStartTime(0);
        setEndTime(Math.min(60, videoDuration));
        break;
      case "last":
        const lastStart = Math.max(0, videoDuration - 60);
        setStartTime(lastStart);
        setEndTime(videoDuration);
        break;
      case "middle":
        const middleStart = Math.max(0, videoDuration / 2 - 30);
        setStartTime(middleStart);
        setEndTime(Math.min(videoDuration, middleStart + 60));
        break;
    }
  };

  const resetVideoElement = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.src = "";
      videoRef.current.load();
    }
  };

  const handleTrimVideo = async () => {
    if (isProcessing || !ffmpegRef.current) return;

    setIsProcessing(true);
    setTrimProgress(0);

    try {
      if (videoDuration <= 60) {
        resetVideoElement();
        onTrimComplete(videoFile);
        return;
      }

      if (!ffmpegLoaded) {
        alert("Video processor is still loading. Please wait.");
        setIsProcessing(false);
        return;
      }

      const ffmpeg = ffmpegRef.current;
      const segmentDuration = endTime - startTime;

      if (videoRef.current) {
        videoRef.current.pause();
      }

      // Listen to FFmpeg logs to extract current time and calculate progress
      ffmpeg.on("log", ({ message }) => {
        const timeMatch = message.match(/time=(\d+):(\d+):(\d+\.?\d*)/);
        if (timeMatch) {
          const hours = parseFloat(timeMatch[1]);
          const minutes = parseFloat(timeMatch[2]);
          const seconds = parseFloat(timeMatch[3]);
          const currentTime = hours * 3600 + minutes * 60 + seconds;
          const pct = Math.min(
            99,
            Math.round((currentTime / segmentDuration) * 100),
          );
          setTrimProgress(pct);
        }
      });

      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

      setTrimProgress(5);

      await ffmpeg.exec([
        "-ss",
        startTime.toString(),
        "-i",
        "input.mp4",
        "-t",
        segmentDuration.toString(),
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-preset",
        "ultrafast",
        "-crf",
        "28",
        "-movflags",
        "+faststart",
        "-avoid_negative_ts",
        "make_zero",
        "-y",
        "output.mp4",
      ]);

      setTrimProgress(100);

      const data = await ffmpeg.readFile("output.mp4");
      // FIX: Convert the data to a Uint8Array to fix TypeScript error
      const dataArray = new Uint8Array(data as ArrayBuffer);
      const trimmedBlob = new Blob([dataArray], { type: "video/mp4" });

      resetVideoElement();
      onTrimComplete(trimmedBlob);
    } catch (error) {
      alert("Video processing failed. Please try again.");
      setIsProcessing(false);
      setTrimProgress(0);
    }
  };

  const handleCancel = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    onCancel();
  };

  useEffect(() => {
    if (videoRef.current && startTime < videoDuration) {
      videoRef.current.currentTime = startTime;
    }
  }, [startTime, videoDuration, selectedSegment]);

  const segmentDuration = endTime - startTime;
  const isVideoTooShort = videoDuration > 0 && videoDuration <= 60;

  return (
    <div className="fixed inset-0 bg-gray-50 z-[9999] overflow-y-auto overscroll-contain">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="bg-gray-900">
                <div className="relative aspect-video">
                  {videoUrl && (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      onLoadedMetadata={handleLoadedMetadata}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="bg-gray-800 px-4 py-3 text-white text-sm flex items-center justify-between">
                  <span>Preview from {formatTime(startTime)}</span>
                  <span className="text-gray-400">{videoFile.name}</span>
                </div>
              </div>
            </div>

            {/* Processing indicator with progress bar */}
            {isProcessing && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span className="font-medium">Trimming video...</span>
                  <span className="font-bold text-blue-600">
                    {trimProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${trimProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Please wait — do not close this window
                </p>
              </div>
            )}

            {/* FFmpeg load error */}
            {ffmpegLoadError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{ffmpegLoadError}</p>
              </div>
            )}

            {/* Video Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
                  Total Duration
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(videoDuration)}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="text-xs text-blue-600 mb-1 uppercase tracking-wider">
                  Start Time
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatTime(startTime)}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="text-xs text-blue-600 mb-1 uppercase tracking-wider">
                  End Time
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {formatTime(endTime)}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-100">
                <div className="text-xs text-green-600 mb-1 uppercase tracking-wider">
                  Duration
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {formatTime(segmentDuration)}
                </div>
              </div>
            </div>
          </div>

          {/* Segment Selector */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Choose 60-Second Segment
              </h3>

              {/* FFmpeg loading indicator */}
              {!ffmpegLoaded && !ffmpegLoadError && videoDuration > 60 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    Loading video processor...
                  </p>
                </div>
              )}

              {isVideoTooShort && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div>
                      <div className="font-semibold text-blue-900 mb-1">
                        Video is under 1 minute
                      </div>
                      <div className="text-sm text-blue-700">
                        Your video ({formatTime(videoDuration)}) is already
                        under 60 seconds. Click Apply Trim to continue.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isVideoTooShort && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-2">
                    Select which 60 seconds to keep. The preview will jump to
                    that point.
                  </p>
                  <button
                    onClick={() => handleSegmentSelect("first")}
                    disabled={isProcessing}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      selectedSegment === "first"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="font-semibold">First 60 Seconds</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatTime(0)} →{" "}
                      {formatTime(Math.min(60, videoDuration))}
                    </div>
                  </button>

                  <button
                    onClick={() => handleSegmentSelect("middle")}
                    disabled={isProcessing}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      selectedSegment === "middle"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="font-semibold">Middle 60 Seconds</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatTime(Math.max(0, videoDuration / 2 - 30))} →{" "}
                      {formatTime(
                        Math.min(videoDuration, videoDuration / 2 + 30),
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleSegmentSelect("last")}
                    disabled={isProcessing}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      selectedSegment === "last"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="font-semibold">Last 60 Seconds</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatTime(Math.max(0, videoDuration - 60))} →{" "}
                      {formatTime(videoDuration)}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleTrimVideo}
              disabled={
                isProcessing ||
                (!ffmpegLoaded && videoDuration > 60) ||
                videoDuration === 0
              }
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md min-w-[160px] text-center"
            >
              {isProcessing
                ? `Trimming... ${trimProgress}%`
                : !ffmpegLoaded && videoDuration > 60
                  ? "Loading..."
                  : "Apply Trim"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
