import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Footer() {
  const { scrollYProgress } = useScroll();
  const [parallaxScrollRange, setParallaxScrollRange] = useState([0, 1]);
  const [parallaxTransformRange, setParallaxTransformRange] = useState([0, 0]);
  const parallaxY = useTransform(scrollYProgress, parallaxScrollRange, parallaxTransformRange);
  const [containerInView, setContainerInView] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const parallaxContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const bodyElement = document.body;

    const checkInViewState = () => {
      const bodyScrollTop = bodyElement.scrollTop;
      const bodyScrollBottom = bodyScrollTop + window.innerHeight;
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (containerRect && (containerRect.y > bodyScrollTop && containerRect.y < bodyScrollBottom))
        setContainerInView(true);
    };

    checkInViewState();

    if (!containerInView) window.addEventListener("scroll", checkInViewState);

    return () => window.removeEventListener("scroll", checkInViewState);
  }, [containerRef, containerInView]);

  useEffect(() => {
    const getCurrentRange = () => {
      const parallaxContainerElement = parallaxContainerRef.current;

      if (parallaxContainerElement) {
        const parallaxContainerRect = parallaxContainerElement.getBoundingClientRect();
        const currentRangeStart = ((parallaxContainerRect.top + window.scrollY) / document.body.clientHeight);

        setParallaxScrollRange([parseFloat(currentRangeStart.toFixed(2)), 1]);
        setParallaxTransformRange([-parallaxContainerRect.height, 0]);
      }
    }
      
    getCurrentRange();

    window.addEventListener("scroll", getCurrentRange);
    window.addEventListener("resize", getCurrentRange);

    return () => {
      window.removeEventListener("scroll", getCurrentRange);
      window.removeEventListener("resize", getCurrentRange);
    }
  }, [containerRef, containerInView, parallaxContainerRef])

  return (
    <>
      {/* Separator Line */}
          <div className="border-t border-black text-center"></div>

      <footer ref={containerRef} className="bg-white text-black pt-8 pb-16 px-4">
        {containerInView && (
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <img 
                    src="/logohitam.svg" 
                    alt="LevelUp Logo" 
                    className="w-18 h-18"
                  />
                  <span className="text-3xl font-bold">LevelUp</span>
                </div>
                <p className="text-black mb-6 leading-relaxed">
                  Platform untuk UMKM: Marketplace, UMKM Nearby, dan Chatbot AI yang membantu bisnismu berkembang lebih cepat.
                </p>
                <div className="flex gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-black hover:bg-[#FF2000] rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Instagram onClick={() => window.open("#", "_blank")} className="w-5 h-5 text-white cursor-pointer" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-black hover:bg-[#FF2000] rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-black hover:bg-[#FF2000] rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6 text-black">
                  Produk
                </h3>
                <ul className="space-y-3 text-black">
                  <li>
                    <Link
                      to="/marketplace"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      Marketplace
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/umkm-nearby"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      UMKM Nearby
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/chatbot"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      Chatbot AI
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/#promo"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      Promo & Diskon
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/#testimoni"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      Testimoni
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 text-black">
                  Layanan
                </h3>
                <ul className="space-y-3 text-black">
                  <li>
                    <Link
                      to="/register"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      Daftar
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      Masuk
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/#bantuan"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      Bantuan
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/#tentang"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      Tentang Kami
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/#kontak"
                      className="hover:text-[#FF2000] transition-colors"
                    >
                      Kontak
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 text-black">
                  Kontak
                </h3>
                <ul className="space-y-3 text-black">
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4" />
                    <span>+62 812-3456-7890</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4" />
                    <span>support@levelup.id</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <MapPin className="w-4 h-4" />
                    <span>Banda Aceh, Indonesia</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Parallax JAKSABANG - Behind Footer Effect */}
            <div ref={parallaxContainerRef} className="relative overflow-hidden py-4 sm:py-8 md:py-16 border-t border-black">
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <motion.div
                  className="text-[14vw] md:text-9xl lg:text-[14vw] xl:text-[12rem] font-black text-black whitespace-nowrap select-none"
                  style={{
                    y: parallaxY,
                  }}
                >
                  LEVELUP
                </motion.div>
              </div>
              {/* Gradient overlay to create behind effect */}
              <div className="absolute inset-0 z-0 bg-gradient-to-b from-white via-white to-white pointer-events-none"></div>
              <div className="relative z-10 h-32"></div>
            </div>

            <div className="border-t border-black pt-8 text-center">
              <p className="text-black">
                ©2025 LevelUp. All rights reserved.
              </p>
            </div>
          </div>
        )}
      </footer>
    </>
  );
}