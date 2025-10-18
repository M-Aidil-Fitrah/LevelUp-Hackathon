import { useEffect, useState } from "react";
import type { ComponentType } from "react";

const Hero = () => {
  const [AnimatedComp, setAnimatedComp] = useState<ComponentType<any> | null>(null);
  const [showAnimated, setShowAnimated] = useState(false);

  // Defer loading the heavy animated component until after first paint/idle
  useEffect(() => {
    const load = () => import("@/components/ui/text-generate-effect").then(mod => {
      // Load module then schedule showing animation shortly after
      setAnimatedComp(() => mod.TextGenerateEffect as any);
      // Give browser a moment to paint static text first
      setTimeout(() => setShowAnimated(true), 100);
    });
    // Prefer idle to avoid blocking initial work
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(load);
    } else {
      setTimeout(load, 400);
    }
  }, []);

  return (
    <section id="beranda" className="relative min-h-screen flex items-center bg-white overflow-hidden">
      {/* Background word 'LevelUp' */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-x-0 -bottom-8 md:bottom-0 flex justify-center md:justify-start md:pl-10 lg:pl-16 xl:pl-24"
      >
        <span className="display-serif font-semibold text-slate-900/5 leading-none tracking-tight text-[24vw] md:text-[22vw] lg:text-[20vw]">
          LevelUp
        </span>
      </div>

      <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 py-20 md:py-24">
        <div className="max-w-[1100px] relative z-10">
          {/* Headline: render fast static text first to improve LCP; swap to animated when idle */}
          <div className="display-serif text-slate-900 leading-[0.95] tracking-tight">
            {/* Static immediate render for LCP */}
            {!showAnimated && (
              <h1 className="text-[42px] sm:text-[56px] md:text-[84px] lg:text-[104px] xl:text-[116px] font-semibold">
                <span className="block">Platform yang</span>
                <span className="block">memberdayakan</span>
                <span className="block">UMKM Anda</span>
              </h1>
            )}
            {/* Animated version appears after idle */}
            {showAnimated && AnimatedComp && (
              <div aria-hidden>
                <AnimatedComp
                  words={"Platform yang"}
                  duration={0.5}
                  filter={true}
                  startDelay={0}
                  textClassName="block text-[42px] sm:text-[56px] md:text-[84px] lg:text-[104px] xl:text-[116px] font-semibold"
                />
                <AnimatedComp
                  words={"memberdayakan"}
                  duration={0.5}
                  filter={true}
                  startDelay={0.4}
                  textClassName="block text-[42px] sm:text-[56px] md:text-[84px] lg:text-[104px] xl:text-[116px] font-semibold"
                />
                <AnimatedComp
                  words={"UMKM Anda"}
                  duration={0.5}
                  filter={true}
                  startDelay={0.8}
                  textClassName="block text-[42px] sm:text-[56px] md:text-[84px] lg:text-[104px] xl:text-[116px] font-semibold"
                />
              </div>
            )}
          </div>

          {/* Sub-headline: static first, animated later */}
          <div className="mt-7 md:mt-9 max-w-[720px] text-slate-700">
            {!showAnimated && (
              <p className="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] leading-[1.5]">
                Tingkatkan bisnis UMKM Anda dengan teknologi digital. Kelola inventori, penjualan, dan keuangan dengan mudah — cukup dari satu platform terpadu.
              </p>
            )}
            {showAnimated && AnimatedComp && (
              <AnimatedComp
                words={"Tingkatkan bisnis UMKM Anda dengan teknologi digital. Kelola inventori, penjualan, dan keuangan dengan mudah — cukup dari satu platform terpadu."}
                duration={0.4}
                filter={true}
                startDelay={1.2}
                bold={false}
                textClassName="text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] leading-[1.5]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;