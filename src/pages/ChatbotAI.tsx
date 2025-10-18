import React, { Suspense } from "react";
import PillNav from "@/components/PillNav";
import { useLocation } from "react-router-dom";
const ChatbotUI = React.lazy(() => import("@/components/chatbot/ChatbotUI"));
import { Footer } from "@/components/Footer";
import { LazyVisible } from "@/hooks/use-in-viewport";

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
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Chatbot AI</h1>
          <LazyVisible placeholderHeight={520} options={{ rootMargin: '200px' }}>
            <div className="relative max-w-5xl mx-auto">
              <Suspense fallback={<div className="h-[520px] w-full bg-neutral-50" aria-hidden />}> 
                <ChatbotUI />
              </Suspense>
            </div>
          </LazyVisible>
        </div>
      </main>

      <LazyVisible placeholderHeight={200} options={{ rootMargin: '200px' }}>
        <Footer />
      </LazyVisible>
    </div>
  );
};

export default ChatbotAI;
