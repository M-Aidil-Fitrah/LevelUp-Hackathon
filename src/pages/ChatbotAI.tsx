import PillNav from "@/components/PillNav";
import { useLocation } from "react-router-dom";
import ChatbotUI from "@/components/chatbot/ChatbotUI";
import { Footer } from "@/components/Footer";

const ChatbotAI = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-white flex flex-col">
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

      <main className="flex-1 px-4 md:px-6 lg:px-8 pt-24 pb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Chatbot AI</h1>
        <div className="max-w-5xl mx-auto">
          <ChatbotUI />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatbotAI;
