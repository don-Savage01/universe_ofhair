import AnnouncementBar from "./components/AnnouncementBar";
import Hero from "./components/Hero";
import ProductPreview from "./components/ProductPreview";
import FullRange from "./components/FullRange";
import ReviewSection from "./components/ReviewSection";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Hero />
      <ProductPreview />
      <FullRange />
      <ReviewSection />
    </>
  );
}
