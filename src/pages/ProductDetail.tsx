"use client";

import PillNav from "@/components/PillNav";
import { Footer } from "@/components/Footer";
import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";

export default function ProductDetail() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const storeId = params.get("storeId");
  const productId = params.get("productId");

  // In a real app, fetch by ids; here we only show ids
  return (
    <div className="min-h-screen w-full bg-white">
      <PillNav
        logo={"/logoputih.svg"}
        logoAlt={"LevelUp Logo"}
        items={[
          { label: "Home", href: "/" },
          { label: "Marketplace", href: "/marketplace" },
          { label: "UMKM Nearby", href: "/umkm-nearby" },
          { label: "Chatbot AI", href: "/chatbot" },
          { label: "Register", href: "/register", variant: "accent" },
          { label: "Login", href: "/login", variant: "accent" },
        ]}
        activeHref={"/product-detail"}
        className="custom-nav"
        ease="power2.easeOut"
        baseColor="#000000"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
        accentColor="#FF2000"
      />

      <div className="h-16 md:h-20" />

      <div className="mx-auto max-w-4xl px-4 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Detail Produk</h1>
          <Link to={storeId ? `/marketplace-product?storeId=${storeId}` : "/marketplace"} className="text-orange-600 hover:underline">Kembali ke Produk Toko</Link>
        </div>
        <p className="text-gray-500 mt-1">storeId: {storeId ?? '-'} · productId: {productId ?? '-'}</p>

        <div className="mt-6 border rounded-xl p-6">
          <p className="text-gray-700">
            Halaman ini disiapkan untuk menampilkan detail produk lengkap yang bisa diisi dari API/DB. Saat ini hanya menampilkan parameter URL.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
