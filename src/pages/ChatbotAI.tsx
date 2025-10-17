import PillNav from "@/components/PillNav";
import { useLocation } from "react-router-dom";
import ChatbotUI from "@/components/chatbot/ChatbotUI";
import { Footer } from "@/components/Footer";
import Threads from "@/components/Threads";

const ChatbotAI = () => {
  const location = useLocation();
  return (
  <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
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

      <main className="relative flex-1 px-4 md:px-6 lg:px-8 pt-24 pb-12">
        {/* Full main-area Threads background so tetap terlihat di sekitar UI */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Threads color={[1, 0.125, 0]} amplitude={1.2} distance={0.5} enableMouseInteraction={false} />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Chatbot AI</h1>
          <div className="relative max-w-5xl mx-auto">
            <ChatbotUI />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatbotAI;
