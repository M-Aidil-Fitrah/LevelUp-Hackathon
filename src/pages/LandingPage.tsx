import Hero from "@/components/Hero";
import PillNav from "@/components/ui/PillNav";
import MagicBento from "@/components/MagicBento";
import { useLocation } from "react-router-dom";
import InfiniteMarquee from "@/components/InfiniteMarquee";

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
  <Hero />
  <InfiniteMarquee className="mt-6" text="Marketplace - UMKM Nearby - Chatbot AI" direction="right" duration={30} />
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
    </div>
  );
};

export default LandingPage;
