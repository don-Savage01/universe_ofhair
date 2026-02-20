"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
// Simple Arrow components
// Thin Chevron Arrow components
// Single Line Arrow components (like the screenshot)
const LeftArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
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
    className="h-6 w-6"
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

export default function FullRange() {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const reviewsContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    reviewsContainerRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    reviewsContainerRef.current?.scrollBy({ left: 400, behavior: "smooth" });
  };

  const checkScrollPosition = () => {
    const container = reviewsContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 10);

    const isAtEnd =
      Math.abs(
        container.scrollWidth - container.clientWidth - container.scrollLeft
      ) < 10;
    setShowRightArrow(!isAtEnd);
  };

  useEffect(() => {
    const container = reviewsContainerRef.current;
    if (!container) return;

    checkScrollPosition();

    container.addEventListener("scroll", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
    };
  }, []);

  return (
    <>
      {/* Gray background section for text */}
      {/* Gray background section for text */}
      <section
        className="py-10 px-4"
        style={{ backgroundColor: "rgb(85, 86, 81)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center md:text-left">
            <h3 className="text-4xl font-bold mb-6 text-white">
              SHOP THE FULL RANGE
            </h3>
            <p className="text-gray-200 text-lg leading-relaxed mb-8">
              Our hair is Virgin European remy human hair for both of closures
              and wefts. We recommend our closures will last 6-12 months with
              the average customer needing 1/2 closures per year.
            </p>
            <div className="flex justify-center md:justify-start">
              <Link href="/shop">
                <button className="bg-white text-black px-8 py-3 rounded-md hover:bg-gray-100 transition-colors font-medium">
                  SHOP
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* White background section with image and text */}
      <section className="bg-white py-2 md:py-6">
        <div className="max-w-7xl mx-auto px-2.5">
          <div className="flex flex-col md:flex-row md:items-stretch md:gap-6">
            {/* Image Container - Left side on desktop, FORCED FULL HEIGHT */}
            <div className="w-full md:w-1/2">
              <div className="relative w-full h-60 md:h-[450px] md:min-h-full ">
                <Image
                  src="/images/stylist.jpg"
                  alt="Hair Stylist Showcase"
                  fill
                  className="object-contain md:object-cover"
                  sizes="(max-width: 820px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            {/* Text Container - Right side on desktop */}
            <div className="w-full md:w-1/2 md:pl-0 mt-4 md:mt-0 text-center md:text-left">
              <div className="space-y-3 md:space-y-4 md:h-full md:flex md:flex-col md:justify-center">
                <p className="text-base md:text-lg">
                  <strong>HAIR UNIVERSE</strong> is a Nigerian based hair
                  supplier providing premium European human hair with high
                  quality lace and silk base closures to customers worldwide.
                </p>

                <p className="text-base md:text-lg">
                  With over 10 years of experience in the hair loss industry and
                  more than 17 years in the hair industry, we are able to offer
                  an excellent, professional, and personal service.
                </p>

                <p className="text-base md:text-lg">
                  As experienced professionals in the hair industry, we know how
                  difficult it can be for hair loss technicians to find a
                  dependable supplier with excellent service. This is exactly
                  how we can support you.
                </p>

                <p className="text-base md:text-lg">
                  We source the highest quality hair at competitive prices,
                  designed to last for many months with proper aftercare and
                  regular maintenance.
                </p>

                <div>
                  <h3 className="text-lg md:text-xl mb-2">
                    We provide expertly crafted custom made closures and wefts,
                    designed to suit each client&apos;s unique requirements.
                  </h3>
                  <div className="text-left">
                    <p className="font-medium mb-1">This Includes:</p>
                    <ul className="list-disc pl-5 space-y-1 text-sm md:text-base">
                      <li>Curly Closures</li>
                      <li>Various Density Closures</li>
                      <li>Larger Sized Closures Upto 7x7</li>
                      <li>Hybrid Closures</li>
                      <li>Any Colour/Rooted Combination</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 md:m-3 text-center">
                  {/* Adding text-center here ensures the Link/Button centers correctly */}

                  <p className="font-light text-gray-800">
                    Explore our complete range of bespoke beauty enhancements.
                  </p>

                  <Link
                    href="/services"
                    className="inline-block bg-gray-700 text-white px-6 py-2 rounded-sm mt-4 hover:bg-gray-800 transition-colors"
                  >
                    View Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEPARATE REVIEWS SECTION - Starts under everything above */}
      <section
        className="py-4 md:py-4" //pt-2 md:pt-4
        style={{ backgroundColor: "rgb(234, 233, 228)" }}
      >
        {/* Full width gray background container - OUTSIDE the max-w container */}
        <div
          className="text-center py-4 mb-10 text-white "
          style={{ backgroundColor: "rgb(85, 86, 81)" }}
        >
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">REVIEWS</h2>
            <p className="text-lg md:text-xl font-light">
              Our hair speaks for itself. Explore honest feedback from the
              technicians and clients who rely on our collections for their
              signature transformations.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {/* Horizontal Scrollable Review Cards Container WITH ARROWS */}
          <div className="mb-10 relative">
            {/* Left Arrow - Only show when needed */}
            {showLeftArrow && (
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 p-2 md:p-3 transition-all"
                onClick={scrollLeft}
              >
                <LeftArrow />
              </button>
            )}

            {/* Right Arrow - Only show when needed */}
            {showRightArrow && (
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 p-2 md:p-3 transition-all"
                onClick={scrollRight}
              >
                <RightArrow />
              </button>
            )}

            {/* Review Cards Container - Use ref instead of id */}
            <div
              ref={reviewsContainerRef}
              className="flex overflow-x-auto pb-6 space-x-6 scrollbar-hide scroll-smooth"
            >
              {/* Review Card 1 */}
              <div className="shrink-0 w-[80%] md:w-[500px] bg-gray-50 p-6 rounded-lg border border-gray-200">
                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/reviewers/dp_blacknificent.jpg"
                      alt="Blacknifenct Queen"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Blacknifenct Queen
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    Not only did I purchase a beautiful wig here, but the
                    bleaching and tinting Olamide did to match my skin tone was
                    perfect. It looks so natural, like it&apos;s growing from my
                    scalp. I walked out with a ready to wear masterpiece.
                  </p>
                </div>
                {/* Desktop Layout */}
                <div className="hidden md:flex">
                  <div className="shrink-0 flex items-center justify-center mr-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden">
                      <Image
                        src="/images/reviewers/dp_blacknificent.jpg"
                        alt="Blacknifenct Queen"
                        width={120}
                        height={120}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Blacknifenct Queen
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      Not only did I purchase a beautiful wig here, but the
                      bleaching and tinting Olamide did to match my skin tone
                      was perfect. It looks so natural, like it&apos;s growing
                      from my scalp. I walked out with a ready to wear
                      masterpiece.
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Card 2 */}
              <div className="shrink-0 w-[80%] md:w-[500px] bg-gray-50 p-6 rounded-lg border border-gray-200">
                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/reviewers/dp_dorathy.jpg"
                      alt="Dorathy"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Mellah Dorathy
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    Needed a protective style in a hurry for a trip, and she
                    delivered! The quick weave she did was so secure and
                    stylish. It lasted my entire vacation without any issues.
                    Her work is not only beautiful but also durable
                  </p>
                </div>
                {/* Desktop Layout */}
                <div className="hidden md:flex">
                  <div className="shrink-0 flex items-center justify-center mr-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden">
                      <Image
                        src="/images/reviewers/dp_dorathy.jpg"
                        alt="Mellah Dorathy"
                        width={120}
                        height={120}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Mellah Dorathy
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      Needed a protective style in a hurry for a trip, and she
                      delivered! The quick weave she did was so secure and
                      stylish. It lasted my entire vacation without any issues.
                      Her work is not only beautiful but also durable
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Card 3 */}
              <div className="shrink-0 w-[80%] md:w-[500px] bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="md:hidden flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/reviewers/dp_precious.jpg"
                      alt="Loveth"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Loveth Precious
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    I came in for knotless braids and was AMAZED at the neatness
                    and precision! She was so gentle, there was zero unnecessary
                    tension on my edges. The braids are flawless, light, and the
                    best i&apos;ve ever had. I&apos;ve found my forever braider!
                  </p>
                </div>
                <div className="hidden md:flex">
                  <div className="shrink-0 flex items-center justify-center mr-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden">
                      <Image
                        src="/images/reviewers/dp_precious.jpg"
                        alt="Loveth Precious"
                        width={120}
                        height={120}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Loveth Precious
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      I came in for knotless braids and was AMAZED at the
                      neatness and precision! She was so gentle, there was zero
                      unnecessary tension on my edges. The braids are flawless,
                      light, and the best I&apos;ve ever had. I&apos;ve found my
                      forever braider!
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Card 4 */}
              <div className="shrink-0 w-[80%] md:w-[500px] bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="md:hidden flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/reviewers/dp_stephanie.jpg"
                      alt="Stephanie"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Stephanie Nweke
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    I brought in an old tangled wig that I thought was ruined.
                    She completely revived it! Through careful detangling, a
                    deep wash, and a stunning new cut and style, she made it
                    look brand new honestly, even far better than when I first
                    bought it. This service saved me so much money. Olamide you
                    are truly a pro at what you do ❤️
                  </p>
                </div>
                <div className="hidden md:flex ">
                  <div className="shrink-0 flex items-center justify-center mr-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden">
                      <Image
                        src="/images/reviewers/dp_stephanie.jpg"
                        alt="Stephanie Nweke"
                        width={120}
                        height={120}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Stephanie Nweke
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      I brought in an old tangled wig that I thought was ruined.
                      She completely revived it! Through careful detangling, a
                      deep wash, and a stunning new cut and style, she made it
                      look brand new honestly, even far better than when I first
                      bought it. This service saved me so much money. Olamide
                      you are truly a pro at what you do ❤️
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Card 5 */}
              <div className="shrink-0 w-[80%] md:w-[500px] bg-gray-50 p-6 rounded-lg border border-gray-200">
                {/* Mobile Layout */}
                <div className="md:hidden flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/reviewers/dp_daniella.jpg"
                      alt="Daniella"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Danielle Ebele
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    I&apos;ve repeatedly chosen her for closure purchases and
                    installations. Each time, the parting is immaculate, the
                    lace is invisible, and she executes my desired style
                    perfectly. She managed to transform my entire look in a
                    single session. I&apos;m deeply grateful for her patience
                    and extraordinary expertise.
                  </p>
                </div>
                {/* Desktop Layout */}
                <div className="hidden md:flex">
                  <div className="shrink-0 flex items-center justify-center mr-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden">
                      <Image
                        src="/images/reviewers/dp_daniella.jpg"
                        alt="Danielle Ebele"
                        width={120}
                        height={120}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Danielle Ebele
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      I&apos;ve repeatedly chosen her for closure purchases and
                      installations. Each time, the parting is immaculate, the
                      lace is invisible, and she executes my desired style
                      perfectly. She managed to transform my entire look in a
                      single session. I&apos;m deeply grateful for her patience
                      and extraordinary expertise.
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Card 6 */}
              <div className="shrink-0 w-[80%] md:w-[500px] bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="md:hidden flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/reviewers/dp_abisola.jpg"
                      alt="Abisola"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Abisola Abby
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    I was confused about what would suit my face shape. She took
                    the time to consult with me, showed me options, and created
                    the perfect wig style. She didn&apos;t just sell me hair,
                    she gave me confidence. The service here is top tier.
                  </p>
                </div>
                <div className="hidden md:flex">
                  <div className="shrink-0 flex items-center justify-center mr-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden">
                      <Image
                        src="/images/reviewers/dp_abisola.jpg"
                        alt="Abisola Abby"
                        width={120}
                        height={120}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Abisola Abby
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      I was confused about what would suit my face shape. She
                      took the time to consult with me, showed me options, and
                      created the perfect wig style. She didn&apos;t just sell
                      me hair, she gave me confidence. The service here is top
                      tier.
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Card 7 */}
              <div className="shrink-0 w-[80%] md:w-[500px] bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="md:hidden flex flex-col items-center text-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-4">
                    <Image
                      src="/images/reviewers/dp_simi.jpg"
                      alt="simi"
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Simi O.A
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    I&apos;ve been a client for braids, wigs, and revamps. Every
                    single time, the quality of her work is exceptional. Her
                    attention to detail, from the neatness of the braids to the
                    flawless wig line, is consistent. She is truly talented and
                    it shows in every style she creates
                  </p>
                </div>
                <div className="hidden md:flex">
                  <div className="shrink-0 flex items-center justify-center mr-6">
                    <div className="w-28 h-28 rounded-full overflow-hidden">
                      <Image
                        src="/images/reviewers/dp_simi.jpg"
                        alt="Simi O.A"
                        width={120}
                        height={120}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Simi O.A
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      I&apos;ve been a client for braids, wigs, and revamps.
                      Every single time, the quality of her work is exceptional.
                      Her attention to detail, from the neatness of the braids
                      to the flawless wig line, is consistent. She is truly
                      talented and it shows in every style she creates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
