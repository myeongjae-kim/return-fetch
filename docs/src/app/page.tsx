import HeroSection from "@/app/components/HeroSection";
import BadgeSection from "@/app/components/BadgeSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <div className={"mx-4 md:mx-12 lg:mx-24 xl:mx-80"}>
        <BadgeSection />
      </div>
    </main>
  );
}
