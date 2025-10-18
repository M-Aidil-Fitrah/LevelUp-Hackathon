import React, { Suspense } from "react";
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
      <LazyVisible placeholderHeight={640}>
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
