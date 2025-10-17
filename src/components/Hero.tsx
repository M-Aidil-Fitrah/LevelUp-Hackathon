const Hero = () => {
  return (
    <section id="beranda" className="relative min-h-screen flex items-center bg-white overflow-hidden">
      {/* Background word 'LevelUp' ala Brave */}
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
          {/* Headline ala Brave: serif besar, rapat, kiri */}
          <h1 className="display-serif text-slate-900 leading-[0.95] tracking-tight">
            <span className="block text-[42px] sm:text-[56px] md:text-[84px] lg:text-[104px] xl:text-[116px] font-semibold">
              Platform yang
            </span>
            <span className="block text-[42px] sm:text-[56px] md:text-[84px] lg:text-[104px] xl:text-[116px] font-semibold">
              memberdayakan
            </span>
            <span className="block text-[42px] sm:text-[56px] md:text-[84px] lg:text-[104px] xl:text-[116px] font-semibold">
              UMKM Anda
            </span>
          </h1>

          {/* Sub-headline besar, nyaman dibaca */}
          <p className="subcopy mt-7 md:mt-9 text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] text-slate-700 leading-[1.5] max-w-[720px]">
            Tingkatkan bisnis UMKM Anda dengan teknologi digital. Kelola inventori,
            penjualan, dan keuangan dengan mudah — cukup dari satu platform terpadu.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;