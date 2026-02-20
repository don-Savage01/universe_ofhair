"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function ProductPreview() {
  const products = [
    {
      id: 1,
      name: "Virgin Hair",
      image: "/images/samples/sample_one.jpg",
    },
    { id: 2, name: "Closure Set", image: "/images/samples/sample_two.jpg" },
    {
      id: 3,
      name: "Weft Extensions",
      image: "/images/samples/sample_three.jpg",
    },
    { id: 4, name: "Braid", image: "/images/samples/sample_four.jpg" },
    { id: 5, name: "Braid", image: "/images/samples/sample_five.jpg" },
    { id: 6, name: "Knotless Braid", image: "/images/samples/sample_six.jpg" },
    { id: 7, name: "Twist Braid", image: "/images/samples/sample_seven.jpg" },
    {
      id: 8,
      name: "Bone Straight",
      image: "/images/samples/sample_ten.jpg",
    },
    { id: 9, name: "Bone Straight", image: "/images/samples/sample_nine.jpg" },
    {
      id: 10,
      name: "Bone Straight",
      image: "/images/samples/sample_eight.jpg",
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;

      // Show left arrow if scrolled right
      setShowLeftArrow(scrollLeft > 0);

      // Show right arrow if not at the end
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();

      // Cleanup
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

  return (
    <section className="py-2.5 px-2 bg-white">
      <div className="max-w-6xl mx-auto relative">
        {/* Instagram-style grid with horizontal scroll */}
        <div className="relative">
          {/* Left Arrow - Made consistent with right arrow */}
          {showLeftArrow && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 bg-white/80 hover:bg-white p-0.5 rounded-full shadow-lg border border-gray-200 transition-all duration-300 hover:scale-110"
              aria-label="Scroll left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Horizontal scrollable row */}
          <div
            ref={containerRef}
            className="flex overflow-x-auto gap-4 md:gap-6 scrollbar-hide px-2"
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="shrink-0 overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-out bg-white"
              >
                {/* Square Instagram-style image container */}
                <div className="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 group">
                  {/* ⬇️⬇️⬇️ JUST THE IMAGE COMPONENT - NO PLACEHOLDER DIV ⬇️⬇️⬇️ */}
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 bg-white/80 hover:bg-white p-0.5 rounded-full shadow-lg border border-gray-200 transition-all duration-300 hover:scale-110"
              aria-label="Scroll right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
