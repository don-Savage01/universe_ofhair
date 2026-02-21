"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Keyboard, EffectFade } from "swiper/modules";
import Link from "next/link";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";

const LeftArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 25 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M15 19l-7-7m0 0l7-7m-7 7h14"
    />
  </svg>
);

const RightArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 25 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M9 5l7 7m0 0l-7 7m7-7H2"
    />
  </svg>
);

const BackArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);

const MusicIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    {/* Speaker icon - visible in both states */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />

    {/* Slash line when muted (NOT playing) */}
    {!isPlaying && (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18"
        className="text-gray-200"
      />
    )}
  </svg>
);

export default function ReviewSection() {
  const [showLeftArrowDesktop, setShowLeftArrowDesktop] = useState(false);
  const [showRightArrowDesktop, setShowRightArrowDesktop] = useState(true);
  const [showLeftArrowMobile, setShowLeftArrowMobile] = useState(false);
  const [showRightArrowMobile, setShowRightArrowMobile] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Gallery states
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const gallerySwiperRef = useRef<any>(null);

  // Gallery images array - using your nail images
  const galleryImages = [
    "/images/makeup/nail_one.jpg",
    "/images/makeup/nail_two.jpg",
    "/images/makeup/nail_three.jpg",
    "/images/makeup/nail_four.jpg",
    "/images/makeup/nail_five.jpg",
    "/images/makeup/nail_six.jpg",
    "/images/makeup/nail_seven.jpg",
    "/images/makeup/nail_eight.jpg",
  ];

  // Function to prevent scroll
  const preventScroll = (e: WheelEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Close fullscreen function
  const closeFullscreen = () => {
    setIsFullscreen(false);
    setSelectedVideo(null);

    if (window.history.state?.isFullscreen) {
      window.history.back();
    }

    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.pause();
    }
  };

  // Handle gallery click
  const handleGalleryClick = () => {
    setShowImageGallery(true);
    setIsPlaying(true);
    setActiveGalleryIndex(0);

    window.history.pushState({ isGalleryOpen: true }, "");

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play error:", e));
      }
    }, 300);
  };

  // Close gallery function
  const closeGallery = () => {
    setShowImageGallery(false);
    setIsPlaying(false);

    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Remove history state
    if (window.history.state?.isGalleryOpen) {
      window.history.back();
    }
  };

  // Toggle audio play/pause
  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Sample videos array with gallery as the 4th item (after 3 videos)
  const smpvids = [
    {
      type: "video",
      id: 1,
      title: "Seamless Styling Wigs",
      videoUrl: "/videos/smpvid_one.mp4",
      views: "842.4K",
    },
    {
      type: "video",
      id: 2,
      title: "Flawless Glow",
      videoUrl: "/videos/smpvid_two.mp4",
      views: "768.3K",
    },
    // ✅ GALLERY CARD — EXACT POSITION YOU WANT (4th position)
    {
      type: "gallery",
      id: 9,
      title: "Custom Nail Designs",
      thumbnail: "/images/makeup/nail_one.jpg",
      views: "665.7K",
    },
    {
      type: "video",
      id: 3,
      title: "Effortless Flow",
      videoUrl: "/videos/smpvid_three.mp4",
      views: "620.2K",
    },

    {
      type: "video",
      id: 4,
      title: "Scalp Illusion",
      videoUrl: "/videos/smpvid_four.mp4",
      views: "557.6K",
    },
    {
      type: "video",
      id: 5,
      title: "Ready to Wear",
      videoUrl: "/videos/smpvid_five.mp4",
      views: "543.8K",
    },
    {
      type: "video",
      id: 6,
      title: "Beauty in Motion",
      videoUrl: "/videos/smpvid_six.mp4",
      views: "487.1K",
    },
    {
      type: "video",
      id: 7,
      title: "Precision Styling",
      videoUrl: "/videos/smpvid_seven.mp4",
      views: "462.6K",
    },
    {
      type: "video",
      id: 8,
      title: "Braided Elegance",
      videoUrl: "/videos/smpvid_eight.mp4",
      views: "446.3K",
    },
  ];

  const scrollLeftDesktop = () => {
    desktopContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRightDesktop = () => {
    desktopContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  const scrollLeftMobile = () => {
    mobileContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const scrollRightMobile = () => {
    mobileContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  const checkDesktopScrollPosition = () => {
    const container = desktopContainerRef.current;
    if (!container) return;

    setShowLeftArrowDesktop(container.scrollLeft > 10);
    const isAtEnd =
      Math.abs(
        container.scrollWidth - container.clientWidth - container.scrollLeft,
      ) < 10;
    setShowRightArrowDesktop(!isAtEnd);
  };

  const checkMobileScrollPosition = () => {
    const container = mobileContainerRef.current;
    if (!container) return;

    setShowLeftArrowMobile(container.scrollLeft > 10);
    const isAtEnd =
      Math.abs(
        container.scrollWidth - container.clientWidth - container.scrollLeft,
      ) < 10;
    setShowRightArrowMobile(!isAtEnd);
  };

  // Desktop scroll listener
  useEffect(() => {
    const container = desktopContainerRef.current;
    if (!container) return;

    checkDesktopScrollPosition();
    container.addEventListener("scroll", checkDesktopScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkDesktopScrollPosition);
    };
  }, []);

  // Mobile scroll listener
  useEffect(() => {
    const container = mobileContainerRef.current;
    if (!container) return;

    checkMobileScrollPosition();
    container.addEventListener("scroll", checkMobileScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkMobileScrollPosition);
    };
  }, []);

  const handleVideoClick = (videoUrl: string, index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause();
        video.currentTime = 0;
      }
    });

    setSelectedVideo(videoUrl);
    setIsFullscreen(true);
    window.history.pushState({ isFullscreen: true }, "");

    setTimeout(() => {
      if (fullscreenVideoRef.current) {
        fullscreenVideoRef.current
          .play()
          .catch((e) => console.log("Autoplay prevented:", e));
      }
    }, 300);
  };

  const handleItemClick = (item: any, index: number) => {
    if (item.type === "gallery") {
      handleGalleryClick();
    } else {
      handleVideoClick(item.videoUrl, index);
    }
  };

  const handleThumbnailHover = (index: number, isHovering: boolean) => {
    const video = videoRefs.current[index];
    if (video && smpvids[index].type === "video") {
      if (isHovering) {
        video.currentTime = 0;
        video.play().catch((e) => console.log("Hover play prevented:", e));
      } else {
        if (!isFullscreen) {
          video.pause();
          video.currentTime = 0;
        }
      }
    }
  };

  // Control body overflow when fullscreen or gallery is open
  useEffect(() => {
    if (isFullscreen || showImageGallery) {
      // Lock scroll on both html and body
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";

      // Prevent wheel/touch scroll completely
      document.addEventListener("wheel", preventScroll, { passive: false });
      document.addEventListener("touchmove", preventScroll, { passive: false });
    } else {
      // Restore scroll
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.position = "";
      document.body.style.width = "";

      // Remove event listeners
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
    }

    // Cleanup function
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.position = "";
      document.body.style.width = "";

      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [isFullscreen, showImageGallery]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (showImageGallery) {
        closeGallery();
      }
      if (isFullscreen) {
        closeFullscreen();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showImageGallery, isFullscreen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showImageGallery) {
        switch (e.key) {
          case "Escape":
            closeGallery();
            break;
          case " ":
            e.preventDefault();
            if (audioRef.current) {
              if (isPlaying) {
                audioRef.current.pause();
              } else {
                audioRef.current.play();
              }
              setIsPlaying(!isPlaying);
            }
            break;
        }
      } else if (isFullscreen && e.key === "Escape") {
        closeFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageGallery, isFullscreen, isPlaying]);

  return (
    <>
      <section className="bg-white py-4 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
            The Digital Portfolio
          </h2>
          <p className="text-lg md:text-xl text-gray-600 text-center mb-10">
            A curated look at our signature transformations.
          </p>

          {/* Audio element for gallery */}
          <audio ref={audioRef} loop>
            <source src="/audio/nailaud.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>

          {/* Desktop Horizontal Scroll */}
          <div className="hidden md:block relative">
            {showLeftArrowDesktop && (
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                onClick={scrollLeftDesktop}
              >
                <LeftArrow />
              </button>
            )}

            {showRightArrowDesktop && (
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                onClick={scrollRightDesktop}
              >
                <RightArrow />
              </button>
            )}

            <div
              ref={desktopContainerRef}
              className="flex overflow-x-auto pb-8 space-x-6 scrollbar-hide scroll-smooth"
            >
              {smpvids.map((item, index) => (
                <div
                  key={item.id}
                  className="shrink-0 w-[280px] cursor-pointer"
                  onMouseEnter={() => handleThumbnailHover(index, true)}
                  onMouseLeave={() => handleThumbnailHover(index, false)}
                  onClick={() => handleItemClick(item, index)}
                >
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg group">
                    {item.type === "gallery" ? (
                      // Gallery thumbnail
                      <>
                        <div className="absolute inset-0">
                          <Image
                            src={
                              item.thumbnail || "/images/makeup/nail_one.jpg"
                            }
                            alt="Photo Gallery"
                            fill
                            className="object-cover"
                            sizes="280px"
                          />
                        </div>
                        {/* Gallery overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                          <div className="bg-black/60 rounded-full p-4 mb-2">
                            <svg
                              className="w-10 h-10 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <div className="text-white text-sm font-medium">
                              {galleryImages.length} Photos
                            </div>
                            <div className="text-white/80 text-xs mt-1">
                              With Background Music
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Original video thumbnail
                      <>
                        <video
                          ref={(el) => {
                            videoRefs.current[index] = el;
                          }}
                          className="absolute inset-0 w-full h-full object-cover"
                          preload="metadata"
                          muted
                          loop
                          playsInline
                          src={item.videoUrl}
                        >
                          Your browser does not support the video tag.
                        </video>

                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black/60 rounded-full p-4">
                            <svg
                              className="w-10 h-10 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Bottom info - same for both */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-white/90 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                          </svg>
                          {item.views}
                        </span>
                        <span className="text-xs text-white/90">
                          Click to {item.type === "gallery" ? "view" : "play"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="md:hidden relative">
            {showLeftArrowMobile && (
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                onClick={scrollLeftMobile}
              >
                <LeftArrow />
              </button>
            )}

            {showRightArrowMobile && (
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                onClick={scrollRightMobile}
              >
                <RightArrow />
              </button>
            )}

            <div
              ref={mobileContainerRef}
              className="flex overflow-x-auto pb-6 space-x-4 scrollbar-hide scroll-smooth"
            >
              {smpvids.map((item, index) => (
                <div
                  key={item.id}
                  className="shrink-0 w-[200px] cursor-pointer"
                  onClick={() => handleItemClick(item, index)}
                >
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg">
                    {item.type === "gallery" ? (
                      // Gallery thumbnail for mobile
                      <>
                        <div className="absolute inset-0">
                          <Image
                            src={
                              item.thumbnail || "/images/makeup/nail_one.jpg"
                            }
                            alt="Photo Gallery"
                            fill
                            className="object-cover"
                            sizes="200px"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white text-sm truncate">
                                {item.title}
                              </h3>
                              <span className="text-xs text-white/90 flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                </svg>
                                {item.views}
                              </span>
                            </div>
                            <div className="bg-black/60 rounded-full p-2">
                              <svg
                                className="w-5 h-5 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Video thumbnail for mobile
                      <>
                        <video
                          ref={(el) => {
                            videoRefs.current[index] = el;
                          }}
                          className="absolute inset-0 w-full h-full object-cover"
                          preload="metadata"
                          muted
                          loop
                          playsInline
                          src={item.videoUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {item.title}
                          </h3>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-white/90 flex items-center">
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                              </svg>
                              {item.views}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-col md:flex-row md:items-stretch">
              {/* Left side - Text and Button */}
              <div className="md:w-1/2 lg:w-2/5 md:pr-8 lg:pr-12">
                <div className="h-full flex flex-col justify-center px-4 md:px-0">
                  <div className="text-center md:text-left mb-6">
                    <h2 className="text-2xl font-bold mb-3">GET IN TOUCH</h2>
                    <p className="text-gray-700">
                      From individual beauty enhancements to professional hair
                      supplies, we specialize in high-quality custom closures,
                      wefts, and unique color blends. Whether for yourself or
                      your own clientele, get in touch today to access our
                      expert craftsmanship.
                    </p>
                  </div>
                  {/* Button */}
                  <div className="text-center md:text-left">
                    <Link
                      href="/contact"
                      className="inline-flex items-center bg-gray-700 text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium"
                    >
                      CONTACT US
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right side - Image */}
              <div className="md:w-1/2 lg:w-3/5 mt-5 md:mt-0">
                <div className="md:hidden w-screen -ml-4">
                  <div className="relative w-full h-[380px]">
                    <Image
                      src="/images/samples/colordsmp.jpg"
                      alt="Hair products showcase"
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority
                    />
                  </div>
                </div>
                <div className="hidden md:block h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/samples/colordsmp.jpg"
                      alt="Hair products showcase"
                      fill
                      className="object-contain object-right"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 60vw"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen Video Modal */}
      {isFullscreen && selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black" onClick={closeFullscreen}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
            className="absolute top-4 left-4 md:top-8 md:left-8 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-3 md:p-4 transition-all hover:bg-black/70"
            aria-label="Go back"
          >
            <BackArrow />
          </button>

          <div
            className="w-full h-full flex items-center justify-center p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={fullscreenVideoRef}
              className="w-full h-full object-contain"
              controls
              autoPlay
              src={selectedVideo}
              playsInline
              onClick={(e) => e.stopPropagation()}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Image Gallery Modal - Clean version with custom dots */}
      {showImageGallery && (
        <div className="fixed inset-0 z-50 bg-black" onClick={closeGallery}>
          {/* Back Arrow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeGallery();
            }}
            className="absolute top-4 left-4 md:top-8 md:left-8 text-white hover:text-gray-300 z-20 bg-black/50 rounded-full p-3 md:p-4 transition-all hover:bg-black/70"
            aria-label="Go back"
          >
            <BackArrow />
          </button>

          {/* Music Control Button */}
          <button
            onClick={toggleAudio}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-gray-300 z-20 bg-black/50 rounded-full p-3 md:p-4 transition-all hover:bg-black/70"
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            <MusicIcon isPlaying={isPlaying} />
          </button>

          {/* Gallery with Swiper.js - Pure swipe only, no arrow indicators */}
          <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Swiper
              onSwiper={(swiper) => {
                gallerySwiperRef.current = swiper;
              }}
              modules={[Keyboard, EffectFade]} // Removed Autoplay
              keyboard={{
                enabled: true,
              }}
              // Removed autoplay completely
              effect="fade"
              fadeEffect={{ crossFade: true }}
              loop={true}
              speed={500}
              onSlideChange={(swiper) => {
                setActiveGalleryIndex(swiper.realIndex);
              }}
              className="w-full h-full"
            >
              {galleryImages.map((img, index) => (
                <SwiperSlide key={index} className="w-full h-full">
                  <div className="relative w-full h-full">
                    <Image
                      src={img}
                      alt={`Gallery image ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority={index === 0}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Dot Indicators - ALWAYS 5 DOTS, SMART DISTRIBUTION */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center z-10 space-x-3">
                {/* Always show exactly 5 dots */}
                {[0, 1, 2, 3, 4].map((dotIndex) => {
                  const totalImages = galleryImages.length;

                  // For fewer images than dots (1-4 images)
                  if (totalImages <= 5) {
                    // If this dot index is beyond our image count
                    if (dotIndex >= totalImages) {
                      // Show inactive dot that can't be clicked
                      return (
                        <div
                          key={dotIndex}
                          className="w-2 h-2 bg-white opacity-20 rounded-full"
                        />
                      );
                    }

                    // Normal 1:1 mapping for dots to images
                    const isActive = dotIndex === activeGalleryIndex;

                    return (
                      <button
                        key={dotIndex}
                        onClick={() => {
                          if (gallerySwiperRef.current) {
                            gallerySwiperRef.current.slideToLoop(dotIndex);
                          }
                        }}
                        className={`transition-all duration-300 ${
                          isActive
                            ? "w-3 h-3 bg-white opacity-100"
                            : "w-2 h-2 bg-white opacity-40"
                        } rounded-full focus:outline-none`}
                        aria-label={`Go to image ${dotIndex + 1}`}
                      />
                    );
                  }

                  // For 5 or more images, use the smart distribution
                  const totalDots = 5;
                  const baseImagesPerDot = Math.floor(totalImages / totalDots);
                  const remainder = totalImages % totalDots;

                  // Calculate which images this dot represents
                  let startImage = 0;
                  let endImage = 0;

                  if (dotIndex < remainder) {
                    startImage = dotIndex * (baseImagesPerDot + 1);
                    endImage = startImage + baseImagesPerDot;
                  } else {
                    startImage =
                      remainder * (baseImagesPerDot + 1) +
                      (dotIndex - remainder) * baseImagesPerDot;
                    endImage = startImage + baseImagesPerDot - 1;
                  }

                  if (dotIndex === totalDots - 1) {
                    endImage = totalImages - 1;
                  }

                  const isActive =
                    activeGalleryIndex >= startImage &&
                    activeGalleryIndex <= endImage;

                  return (
                    <button
                      key={dotIndex}
                      onClick={() => {
                        if (gallerySwiperRef.current) {
                          gallerySwiperRef.current.slideToLoop(startImage);
                        }
                      }}
                      className={`transition-all duration-300 ${
                        isActive
                          ? "w-3 h-3 bg-white opacity-100"
                          : "w-2 h-2 bg-white opacity-40"
                      } rounded-full focus:outline-none`}
                      aria-label={`Go to images ${startImage + 1}-${
                        endImage + 1
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-stone-700 text-white py-3 md:py-5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-6 mb-2 md:mb-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                <div className="flex justify-center md:justify-start gap-2 md:gap-8">
                  <a
                    href="https://wa.me/+2347046212735"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-700 hover:bg-gray-700 transition-colors"
                    aria-label="WhatsApp"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.76.982.998-3.677-.236-.375a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                    </svg>
                  </a>

                  <a
                    href="https://tiktok.com/@_hair_universe_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-700 hover:bg-gray-700 transition-colors"
                    aria-label="TikTok"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64a2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                </div>

                <div className="flex justify-center md:justify-start gap-2 md:gap-8">
                  <a
                    href="https://www.facebook.com/profile.php?id=61582512740609"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-700 hover:bg-gray-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.instagram.com/_hair_universe1?igsh=MTlqeWkzcjA5NjlyYQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-stone-700 hover:bg-gray-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-white text-sm md:text-base">
                © {new Date().getFullYear()} by Hair Universe. Created by{" "}
                <a
                  href="https://wa.me/+2347081700672"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline transition-all"
                >
                  Don Savage
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
