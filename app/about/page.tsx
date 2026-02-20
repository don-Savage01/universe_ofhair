import HeroSection from "./components/HeroSection";
import AboutContent from "./components/AboutContent"; // Plural
import Footer from "./components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <AboutContent />
      <Footer />
    </div>
  );
}
