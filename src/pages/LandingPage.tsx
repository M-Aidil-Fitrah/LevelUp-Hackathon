import Hero from "@/components/Hero";
import PillNav from "@/components/PillNav";
import { useLocation } from "react-router-dom";

const LandingPage = () => {
      const location = useLocation();
  return (
    <div className="min-h-screen bg-white">
      <PillNav
        logo={"/LevelUp_logo.svg"}
        logoAlt="LevelUp Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Marketplace', href: '/marketplace' },
          { label: 'UMKM Nearby', href: '/umkm-nearby' },
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
    </div>
  );
};

export default LandingPage;
