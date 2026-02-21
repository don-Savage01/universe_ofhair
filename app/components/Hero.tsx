"use client";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative min-h-[50vh] flex items-center justify-center py-5 pt-25 overflow-hidden mt-25 md:mt-10"
      style={{ backgroundColor: "#dcd1cf" }}
    >
      {/* Main container with flex to space text and image */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full px-4 md:pl-8 md:pr-0 gap-8 md:gap-12 relative z-10">
        {/* Text container aligned to left */}
        <div className="text-left z-20 max-w-md lg:max-w-lg order-2 md:order-1 mt-4 md:mt-35">
          <h2 className="text-2xl md:text-3xl font-light mb-6  tracking-widest uppercase">
            Advanced Hair Solutions & Artistry
          </h2>
          <p className="text-lg md:text-xl mb-8 text-gray-600 leading-relaxed">
            Experience a total transformation with expert artistry and modern
            techniques tailored to every hair journey. Whether enhancing your
            natural texture or crafting a custom look, we deliver the full,
            healthy hair you&apos;ve always desired.
          </p>
          <Link
            href="/about"
            className="inline-block bg-gray-700 text-white px-3 py-1 rounded-md text-lg font-medium hover:bg-gray-400 transition-colors mt-8 md:mt-8"
          >
            Learn More
          </Link>
        </div>

        {/* Image container */}
        <div className="relative w-full h-48 md:h-[50vh] order-1 md:order-2 mb-2 md:mb-0 md:w-[80%] md:-mr-10">
          <Image
            src="/images/homepage.jpg"
            alt="Hair extension example"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
            quality={85}
          />
        </div>
      </div>
    </section>
  );
}
