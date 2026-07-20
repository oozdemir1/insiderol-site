import Hero from "@/components/Hero";
import StatsSection from "@/components/sections/StatsSection";
import HowItWorks from "@/components/sections/HowItWorks";
import SalaryPreview from "@/components/sections/SalaryPreview";
import LatestReviews from "@/components/sections/LatestReviews";
import CommunityCTA from "@/components/sections/CommunityCTA";
import TrendsSection from "@/components/sections/TrendsSection";



export default function HomePage() {
  return (
<main>

  <Hero />

  <StatsSection />

  <HowItWorks />

   <TrendsSection />

  <SalaryPreview/>

  <LatestReviews />

  <CommunityCTA />

</main>
  );
}