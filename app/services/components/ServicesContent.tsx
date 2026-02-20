export default function ServicesContent() {
  const services = [
    {
      title: "Nails & Manicures",
      desc: "Your nails are our canvas, and our skilled artists transform them into refined works of art that reflect your unique style and personality.",
      img: "/images/makeup/nail_eight.jpg",
    },
    {
      title: "Hair Styling",
      desc: "Whether you're preparing for a special occasion or simply want to look and feel your best, we create beautiful hairstyles tailored to you.",
      img: "/images/backgrnd/hairstyl.jpg",
    },
    {
      title: "Braided Wigs",
      desc: "Our collection of lace braided wigs features a wide selection of colors, lengths, and styles, thoughtfully designed to reflect your individuality.",
      img: "/images/backgrnd/braidedwig.jpg",
    },
    {
      title: "Textured Wigs",
      desc: "We offer high quality Brazilian and Vietnamese hair and bundles that deliver lasting value for your money.",
      img: "/images/backgrnd/texturedwig.jpg",
    },
    {
      title: "Makeup",
      desc: "From soft day looks to bold glam, we create transformative makeup styles for unforgettable occasions.",
      img: "/images/backgrnd/bckmakeup.jpg",
    },
    {
      title: "At Home Products",
      desc: "We offer high quality hair care products, including shampoos, conditioners, oils, and hair sprays, to keep your hair healthy and nourished.",
      img: "/images/backgrnd/aftercare.jpg",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-1 md:py-1">
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-gray-800 mb-2">
          Explore Our Signature Services
        </h2>
        <p className="text-gray-600">
          At Hair Universe, we offer a curated selection of elite beauty
          services. From restorative hair treatments and precision styling to
          bespoke nail artistry and professional makeup, we specialize in
          crafting your perfect look.
        </p>
      </div>

      {/* THE GRID/STACK CONTAINER */}
      <div className="relative flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
        {services.map((service, index) => {
          const isLast = index === services.length - 1;

          return (
            <div
              key={index}
              style={{ zIndex: index + 1 }}
              className={`
                  sticky md:relative top-0 md:top-auto w-full flex justify-center md:items-center
                  ${
                    isLast
                      ? "h-auto pt-10 pb-20 md:py-0" // Last card: natural height, no sticky trap
                      : "h-screen items-start pt-[10vh] md:h-auto md:pt-0" // Others: sticky track
                  }
                `}
            >
              {/* The Card Container */}
              <div className="relative rounded-3xl overflow-hidden group w-full max-w-[330px] md:max-w-full h-[450px] md:h-[450px] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] md:shadow-lg bg-gray-100 border-none">
                {/* Image Layer */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${service.img})` }}
                />

                {/* Overlay */}
                {/* <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors duration-300" /> */}
                {/* Replace the Overlay div with this */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />

                {/* Content */}
                <div className="relative h-full flex flex-col p-6 md:p-8 text-white">
                  <div className="grow"></div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                      {service.title}
                    </h3>
                    <p className="text-gray-100 text-sm mb-6 max-w-sm font-light leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-50 bg-white w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-8 md:mt-12 md:text-left text-center shadow-[0_30px_45px_-20px_rgba(0,0,0,0.8),0_-25px_40px_-20px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-[rgb(255,172,186)] font-bold uppercase tracking-widest mb-2">
              Hair Universe
            </h2>
            <p className="text-black mb-6">
              We specialize in crafting uncompromising, ready to wear wigs that
              are both comfortable and fashionable. As a leader in the industry,
              we remain committed to creating wigs that elevate your confidence
              and personal style.
            </p>

            <h2 className="text-black font-bold uppercase tracking-widest mb-1.5">
              Braid Wigs
            </h2>
            <p className="text-black mb-6">
              Our braided wigs offer a natural, lightweight solution for
              effortless styling. Featuring a secure elastic band and natural
              looking baby hairs, they&apos;re perfect for anyone who wants the
              look of braids without the time or maintenance.
            </p>

            <h2 className="text-black font-bold uppercase tracking-widest mb-1.5">
              Synthetic Wigs
            </h2>
            <p className="text-black mb-6">
              Hair offers a way to express yourself, embrace your emotions, and
              feel confident. Today&apos;s wigs have transformed from rigid and
              heavy to lightweight, natural, and free flowing.
            </p>

            <h2 className="text-black font-bold uppercase tracking-widest mb-1.5">
              Human Hair Wigs
            </h2>
            <p className="text-black">
              Remy hair is high quality human hair treated with a slow, gentle
              lightening process. By keeping the cuticles intact, this method
              locks in moisture, ensuring soft, healthy, and naturally shiny
              hair.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
