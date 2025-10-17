"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover";
import PillNav from "@/components/PillNav";
import { Footer } from "@/components/Footer";

type Category = "kerajinan" | "kuliner" | "usaha" | "fashion" | "lainnya";

type Product = {
  id: number;
  name: string;
  category: Category;
  priceMin: number; // in IDR thousands for demo (rentang harga)
  priceMax: number; // in IDR thousands for demo (rentang harga)
  distanceKm: number;
  imageUrl: string;
  description?: string;
  address?: string;
};

const DATA: Product[] = [
  {
    id: 1,
    name: "Toko Batik Solo Pak Jono",
    category: "fashion",
    priceMin: 200,
    priceMax: 750,
    distanceKm: 2.1,
  imageUrl: "/assets/images/foto1.png",
    description: "Batik tulis motif klasik, karya UMKM lokal.",
    address: "Jl. Slamet Riyadi No. 123, Solo",
  },
  {
    id: 2,
    name: "Toko Keripik Bu Sari",
    category: "kuliner",
    priceMin: 25,
    priceMax: 100,
    distanceKm: 3.5,
  imageUrl: "/assets/images/foto1.png",
    description: "Cemilan garing rasa pedas gurih.",
    address: "Jl. Diponegoro No. 45, Solo",
  },
  {
    id: 3,
    name: "Toko Rajut Ibu Rina",
    category: "kerajinan",
    priceMin: 80,
    priceMax: 300,
    distanceKm: 1.2,
  imageUrl: "/assets/images/foto1.png",
    description: "Tas rajut unik berbagai warna.",
    address: "Jl. Gatot Subroto No. 8, Solo",
  },
  {
    id: 4,
    name: "Toko Cuci Sepatu Pak Arif",
    category: "usaha",
    priceMin: 20,
    priceMax: 80,
    distanceKm: 5.2,
  imageUrl: "/assets/images/foto1.png",
    description: "Layanan bersih maksimal untuk sepatu kesayangan.",
    address: "Jl. Veteran No. 77, Solo",
  },
  {
    id: 5,
    name: "Toko Kue Bu Lina",
    category: "kuliner",
    priceMin: 50,
    priceMax: 300,
    distanceKm: 4.1,
  imageUrl: "/assets/images/foto1.png",
    description: "Lapis legit premium buatan rumahan.",
    address: "Jl. Sudirman No. 20, Solo",
  },
  {
    id: 6,
    name: "Toko Aksesoris Mak Tuti",
    category: "kerajinan",
    priceMin: 20,
    priceMax: 150,
    distanceKm: 2.8,
  imageUrl: "/assets/images/foto1.png",
    description: "Aksesoris handmade khas nusantara.",
    address: "Jl. Gajah Mada No. 12, Solo",
  },
  {
    id: 7,
    name: "Toko Tenun Pak Agus",
    category: "fashion",
    priceMin: 150,
    priceMax: 600,
    distanceKm: 3.3,
  imageUrl: "/assets/images/foto1.png",
    description: "Outer stylish berbahan tenun ikat.",
    address: "Jl. Ahmad Yani No. 99, Solo",
  },
  {
    id: 8,
    name: "Toko Kopi Pak Dedi",
    category: "lainnya",
    priceMin: 30,
    priceMax: 150,
    distanceKm: 6.7,
  imageUrl: "/assets/images/foto1.png",
    description: "Biji kopi robusta sangrai medium.",
    address: "Jl. Rajiman No. 5, Solo",
  },
  {
    id: 9,
    name: "Toko Mukena Hj. Siti",
    category: "fashion",
    priceMin: 200,
    priceMax: 500,
    distanceKm: 1.9,
    imageUrl: "/assets/images/foto1.png",
    description: "Mukena adem dan nyaman dipakai.",
    address: "Jl. Mangkunegara No. 14, Solo",
  },
  {
    id: 10,
    name: "Toko Nasi Box Mba Yuni",
    category: "kuliner",
    priceMin: 25,
    priceMax: 100,
    distanceKm: 7.5,
    imageUrl: "/assets/images/foto1.png",
    description: "Paket nasi lengkap untuk acara.",
    address: "Jl. Slamet Riyadi No. 200, Solo",
  },
];

type SortBy = "price-asc" | "price-desc" | "distance" | "name-asc" | "";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | Category>("all");
  const [sortBy, setSortBy] = useState<SortBy>("");
  const [page, setPage] = useState(1);
  const pageSize = 9; // 3x3 per halaman

  // Filter + sort memoized
  const filtered = useMemo(() => {
    let items = DATA.filter((item) => {
      const byCategory = category === "all" || item.category === category;
      const q = search.trim().toLowerCase();
      const bySearch = !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false);
      return byCategory && bySearch;
    });

    switch (sortBy) {
      case "price-asc":
        items = items.sort((a, b) => a.priceMin - b.priceMin);
        break;
      case "price-desc":
        items = items.sort((a, b) => b.priceMax - a.priceMax);
        break;
      case "distance":
        items = items.sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case "name-asc":
        items = items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return items;
  }, [category, search, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => {
    setPage(1);
  }, [category, search, sortBy]);

  return (
    <div className="min-h-screen w-full bg-white">
      <PillNav
        logo={'/logoputih.svg'}
        logoAlt={'LevelUp Logo'}
        items={[
          { label: 'Home', href: '/' },
          { label: 'Marketplace', href: '/marketplace' },
          { label: 'UMKM Nearby', href: '/umkm-nearby' },
          { label: 'Chatbot AI', href: '/chatbot' },
          { label: 'Register', href: '/register', variant: 'accent' },
          { label: 'Login', href: '/login', variant: 'accent' }
        ]}
        activeHref={'/marketplace'}
        className="custom-nav"
        ease="power2.easeOut"
        baseColor="#000000"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
        accentColor="#FF2000"
      />

      {/* Spacer agar ada jarak dengan navbar sticky */}
      <div className="h-16 md:h-20" />

      <div className="mx-auto max-w-7xl px-4 pb-8">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-gray-500 mt-1">Jelajahi Toko UMKM di sekitarmu.</p>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="all">Semua Kategori</option>
              <option value="kerajinan">Kerajinan</option>
              <option value="kuliner">Kuliner</option>
              <option value="usaha">Usaha</option>
              <option value="fashion">Fashion</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="">Urutkan</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="distance">Jarak Terdekat</option>
              <option value="name-asc">Nama A-Z</option>
            </select>
          </div>
        </div>

        {/* Counter and reset */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Menampilkan {pageItems.length} dari {filtered.length} produk
          </span>
          <button
            onClick={() => {
              setSearch("");
              setCategory("all");
              setSortBy("");
            }}
            className="text-sm text-orange-600 hover:underline"
          >
            Reset filter
          </button>
        </div>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-16">
              Tidak ada produk yang cocok.
            </div>
          ) : (
            pageItems.map((item) => (
              <Link key={item.id} to={`/marketplace-product?storeId=${item.id}`} className="block">
                <DirectionAwareHover
                  imageUrl={item.imageUrl}
                  className="w-full h-64 md:h-80"
                  showTextAlways={true}
                  childrenClassName="text-white absolute bottom-4 left-4 z-40 px-3 py-2 rounded-md shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-sm">
                      Rp{(item.priceMin * 1000).toLocaleString("id-ID")} - Rp{(item.priceMax * 1000).toLocaleString("id-ID")} · {item.distanceKm}km · {capitalize(item.category)}
                    </p>
                  </div>
                </DirectionAwareHover>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md border text-sm disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: pageCount }).map((_, i) => {
              const idx = i + 1;
              const active = idx === currentPage;
              return (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={
                    "h-9 w-9 rounded-md border text-sm " +
                    (active
                      ? "bg-orange-500 text-white border-orange-500"
                      : "hover:bg-gray-50")
                  }
                >
                  {idx}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={currentPage === pageCount}
              className="px-3 py-2 rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function capitalize<T extends string>(s: T): Capitalize<T> {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<T>;
}
