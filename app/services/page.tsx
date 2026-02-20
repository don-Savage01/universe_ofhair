import HeroSection from "./components/HeroSection";
import ServicesContent from "./components/ServicesContent"; // Plural
import Footer from "./components/Footer";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-glitter-pink">
      <HeroSection />
      <ServicesContent />
      <Footer />
    </div>
  );
}
