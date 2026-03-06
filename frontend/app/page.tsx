import HeroSection from "@/components/landing/hero/heroSection";
import TerrainTypesSection from "@/components/landing/terrainTypes/terrainTypesSection";
import FeaturedTerrainsSection from "@/components/landing/featuredTerrains/featuredTerrainsSection";
import RegionsSection from "@/components/landing/regionsSection/regionsSection";
import HowItWorksSection from "@/components/landing/howItWorks/howItWorksSection";
import SellerSection from "@/components/landing/seller/sellerSection";
import Footer from "@/components/landing/footer/footer";

export default function Home() {
  return (
    <main>

      <HeroSection />

      <FeaturedTerrainsSection />

      <TerrainTypesSection />

      <RegionsSection />

      <HowItWorksSection />

      <SellerSection />

      <Footer />

    </main>
  );
}