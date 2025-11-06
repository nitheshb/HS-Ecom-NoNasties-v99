import Hero from '@/components/home/Hero';
import NewArrivals from '@/components/home/NewArrivals';
import SustainabilityBanner from '@/components/home/SustainabilityBanner';
import ImpactStats from '@/components/home/ImpactStats';
import ForHer from '@/components/home/ForHer';
import ForHim from '@/components/home/ForHim';
import Azulejo from '@/components/home/Azulejo';
import Press from '@/components/home/Press';
import Features from '@/components/home/Features';
import Collections from '@/components/home/Collections';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <SustainabilityBanner />
      <ImpactStats />
      <ForHer />
      <ForHim />
      <Azulejo />
      <NewArrivals />
      <Press />
      <Collections />
      <Features />
    </div>
  );
}
