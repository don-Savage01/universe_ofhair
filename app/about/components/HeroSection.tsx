"use client";

export default function HeroSection() {
  return (
    <div>
      {/* MOBILE VIEW (up to md breakpoint) */}
      <div className="md:hidden relative w-full overflow-hidden">
        <svg
          viewBox="0 0 457 460"
          preserveAspectRatio="none"
          className="w-full h-[460px] block"
        >
          <defs>
            <mask id="wave-mask-mobile">
              {/* Everything visible */}
              <rect width="457" height="460" fill="white" />
              {/* Only bottom ~25% cropped */}
              <path
                d="
                  M0 370
                  C200 300 200 350 300 358
                  250 350 350 380 480 320
                  L457 460
                  L0 460
                  Z
                "
                fill="black"
              />
            </mask>
          </defs>
          <image
            href="/images/about.jpg"
            width="457"
            height="460"
            preserveAspectRatio="none"
            mask="url(#wave-mask-mobile)"
          />
        </svg>
      </div>

      {/* DESKTOP VIEW (md and above) */}
      <div className="hidden md:block relative w-full overflow-hidden">
        {/* Maintain original image aspect ratio */}
        <div className="relative w-full" style={{ aspectRatio: "457/460" }}>
          <svg
            viewBox="0 0 457 460"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet" // Changed to 'meet' to fit without stretching
          >
            <defs>
              {/* Desktop wave mask - less aggressive curve */}
              <mask id="wave-mask-desktop">
                <rect width="457" height="460" fill="white" />
                <path
                  d="
                    M0 390
                    C80 370 160 380 240 385
                    320 390 380 375 420 365
                    457 360 457 360 457 360
                    L457 460
                    L0 460
                    Z
                  "
                  fill="black"
                />
              </mask>
            </defs>

            {/* Image with desktop mask - maintain aspect ratio */}
            <image
              href="/images/about.jpg"
              width="457"
              height="460"
              preserveAspectRatio="xMidYMid meet" // Fit without stretching
              mask="url(#wave-mask-desktop)"
            />
          </svg>

          {/* Optional white wave overlay for desktop */}
          <div className="absolute -bottom-1 left-0 w-full overflow-hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 80"
              preserveAspectRatio="none"
              className="relative block w-full h-12"
            >
              <path
                d="M0,0 L1200,0 L1200,40 C1000,60 800,50 600,40 400,30 200,20 0,30 Z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
