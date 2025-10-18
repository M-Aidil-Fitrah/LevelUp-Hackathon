import React, { Suspense, useEffect, useState } from "react";
import type { ComponentType } from "react";
import Hero from "@/components/Hero";
import PillNav from "@/components/PillNav";
// Lazy-load heavy sections to reduce initial JS and improve FCP/LCP
const MagicBento = React.lazy(() => import("@/components/MagicBento"));
const FlowingMenu = React.lazy(() => import("@/components/FlowingMenu"));
const InfiniteMarquee = React.lazy(() => import("@/components/InfiniteMarquee"));
import { useLocation } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { LazyVisible } from "@/hooks/use-in-viewport";

const demoItems = [
  { link: '#', text: 'Marketplace', image: 'https://picsum.photos/600/400?random=1' },
  { link: '#', text: 'UMKM Nearby', image: 'https://picsum.photos/600/400?random=2' },
  { link: '#', text: 'Chatbot AI', image: 'https://picsum.photos/600/400?random=3' },
];

const LandingPage = () => {
      const location = useLocation();
  // Local component that loads the text-generate-effect only when this section is rendered
  const BentoIntro: React.FC = () => {
    const [TGE, setTGE] = useState<ComponentType<any> | null>(null);
    useEffect(() => {
      let mounted = true;
      import("@/components/ui/text-generate-effect").then((mod) => {
        if (mounted) setTGE(() => mod.TextGenerateEffect as any);
      });
      return () => {
        mounted = false;
      };
    }, []);

    if (!TGE) return null;
    return (
      <>
        <TGE
          words={"Gabung dengan LevelUp"}
          duration={0.5}
          filter={true}
          startDelay={0}
          textClassName="display-serif text-slate-900 text-[36px] sm:text-[44px] md:text-[56px] lg:text-[64px] font-semibold leading-[1.05] tracking-tight"
        />
        <TGE
          words={"Mulai kelola produk dan penjualan di Dashboard Seller, tampil di Marketplace, dan jangkau pembeli terdekat lewat UMKM Nearby—semua dalam satu platform."}
          duration={0.4}
          filter={true}
          startDelay={0.5}
          bold={false}
          textClassName="mt-3 md:mt-4 text-slate-700 text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed max-w-[720px]"
        />
      </>
    );
  };
  return (
    <div className="min-h-screen bg-white">
      <PillNav
        logo={"/logoputih.svg"}
        logoAlt="LevelUp Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Marketplace', href: '/marketplace' },
          { label: 'UMKM Nearby', href: '/umkm-nearby' },
          { label: 'Chatbot AI', href: '/chatbot' },
          { label: 'Register', href: '/register', variant: 'accent' },
          { label: 'Login', href: '/login', variant: 'accent' }
        ]}
        activeHref={location.pathname}
        className="custom-nav"
        ease="power2.easeOut"
        baseColor="#000000"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
        accentColor="#FF2000"
      />
      <LazyVisible placeholderHeight={520}>
        <Hero />
      </LazyVisible>
      <LazyVisible placeholderHeight={64}>
        <Suspense fallback={<div className="mt-6 h-10 w-full bg-neutral-100" aria-hidden />}> 
          <InfiniteMarquee className="mt-6" text="Marketplace - UMKM Nearby - Chatbot AI" direction="right" duration={30} />
        </Suspense>
      </LazyVisible>
      {/* Show Bento intro text only when section is mostly in view */}
      <LazyVisible placeholderHeight={220} options={{ threshold: 0.7, rootMargin: '0px 0px -10% 0px' }}>
        <div className="px-4 md:px-8 lg:px-12 xl:px-24 mt-10 md:mt-14">
          <div className="max-w-5xl">
            <BentoIntro />
          </div>
        </div>
      </LazyVisible>

      {/* Load the bento grid slightly earlier than full visibility for smoother UX */}
      <LazyVisible placeholderHeight={640} options={{ threshold: 0.3, rootMargin: '0px 0px -10% 0px' }}>
        <div className="mt-6">
          <Suspense fallback={<div className="h-[640px] w-full bg-neutral-50" aria-hidden />}> 
            <MagicBento 
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="255, 32, 0"
            />
          </Suspense>
        </div>
      </LazyVisible>
      <LazyVisible placeholderHeight={360}>
        <Suspense fallback={<div className="relative mt-6 h-40 w-full bg-neutral-50" aria-hidden />}> 
          <div className="relative mt-6">
            <FlowingMenu items={demoItems} />
          </div>
        </Suspense>
      </LazyVisible>
      <LazyVisible placeholderHeight={240}>
        <Footer />
      </LazyVisible>
    </div>
  );
};

export default LandingPage;
