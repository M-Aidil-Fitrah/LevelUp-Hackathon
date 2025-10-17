"use client";

import { useEffect, useMemo, useId, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import PillNav from "@/components/PillNav";
import { Footer } from "@/components/Footer";
import { useOutsideClick } from "@/hooks/use-outside-click";

type Category = "kerajinan" | "kuliner" | "usaha" | "fashion" | "lainnya";

type Store = {
  id: number;
  name: string;
  category: Category;
  distanceKm: number;
  imageUrl: string;
  description?: string;
  address?: string;
};

type Product = {
  id: string; // combine storeId and index
  storeId: number;
  name: string;
  category: Category;
  price: number; // in IDR thousands (fixed price)
  imageUrl: string;
  description?: string;
  distanceKm: number; // inherited from store
  address?: string; // inherited from store
};

const STORES: Store[] = [
  {
    id: 1,
    name: "Toko Batik Solo Pak Jono",
    category: "fashion",
    distanceKm: 2.1,
    imageUrl: "/assets/images/foto1.png",
    description: "Batik tulis motif klasik, karya UMKM lokal.",
    address: "Jl. Slamet Riyadi No. 123, Solo",
  },
  {
    id: 2,
    name: "Toko Keripik Bu Sari",
    category: "kuliner",
    distanceKm: 3.5,
    imageUrl: "/assets/images/foto1.png",
    description: "Cemilan garing rasa pedas gurih.",
    address: "Jl. Diponegoro No. 45, Solo",
  },
  {
    id: 3,
    name: "Toko Rajut Ibu Rina",
    category: "kerajinan",
    distanceKm: 1.2,
    imageUrl: "/assets/images/foto1.png",
    description: "Tas rajut unik berbagai warna.",
    address: "Jl. Gatot Subroto No. 8, Solo",
  },
  {
    id: 4,
    name: "Toko Cuci Sepatu Pak Arif",
    category: "usaha",
    distanceKm: 5.2,
    imageUrl: "/assets/images/foto1.png",
    description: "Layanan bersih maksimal untuk sepatu kesayangan.",
    address: "Jl. Veteran No. 77, Solo",
  },
  {
    id: 5,
    name: "Toko Kue Bu Lina",
    category: "kuliner",
    distanceKm: 4.1,
    imageUrl: "/assets/images/foto1.png",
    description: "Lapis legit premium buatan rumahan.",
    address: "Jl. Sudirman No. 20, Solo",
  },
  {
    id: 6,
    name: "Toko Aksesoris Mak Tuti",
    category: "kerajinan",
    distanceKm: 2.8,
    imageUrl: "/assets/images/foto1.png",
    description: "Aksesoris handmade khas nusantara.",
    address: "Jl. Gajah Mada No. 12, Solo",
  },
  {
    id: 7,
    name: "Toko Tenun Pak Agus",
    category: "fashion",
    distanceKm: 3.3,
    imageUrl: "/assets/images/foto1.png",
    description: "Outer stylish berbahan tenun ikat.",
    address: "Jl. Ahmad Yani No. 99, Solo",
  },
  {
    id: 8,
    name: "Toko Kopi Pak Dedi",
    category: "lainnya",
    distanceKm: 6.7,
    imageUrl: "/assets/images/foto1.png",
    description: "Biji kopi robusta sangrai medium.",
    address: "Jl. Rajiman No. 5, Solo",
  },
  {
    id: 9,
    name: "Toko Mukena Hj. Siti",
    category: "fashion",
    distanceKm: 1.9,
    imageUrl: "/assets/images/foto1.png",
    description: "Mukena adem dan nyaman dipakai.",
    address: "Jl. Mangkunegara No. 14, Solo",
  },
  {
    id: 10,
    name: "Toko Nasi Box Mba Yuni",
    category: "kuliner",
    distanceKm: 7.5,
    imageUrl: "/assets/images/foto1.png",
    description: "Paket nasi lengkap untuk acara.",
    address: "Jl. Slamet Riyadi No. 200, Solo",
  },
];

type SortBy = "price-asc" | "price-desc" | "distance" | "name-asc" | "";

export default function MarketplaceProduct() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // State dan id untuk expandable cards
  const [active, setActive] = useState<Product | boolean | null>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Halaman produk tidak auto-buka modal; hanya menggunakan storeId untuk menampilkan produk toko tersebut.

  // Cari toko terpilih & generate produk untuk toko
  const params = new URLSearchParams(location.search);
  const selectedStoreId = params.get("storeId");
  const selectedStore = selectedStoreId
    ? STORES.find((s) => String(s.id) === selectedStoreId)
    : undefined;

  const productsForStore = useMemo(() => {
    if (!selectedStore) return [] as Product[];
    return createProductsForStore(selectedStore);
  }, [selectedStoreId]);

  // Filter + sort di tingkat produk
  const filtered = useMemo(() => {
    let items = productsForStore.filter((item) => {
      const q = search.trim().toLowerCase();
      const bySearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false);
      return bySearch;
    });

    switch (sortBy) {
      case "price-asc":
        items = items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items = items.sort((a, b) => b.price - a.price);
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
  }, [search, sortBy, productsForStore]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, selectedStoreId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref as React.RefObject<HTMLDivElement>, () => setActive(null));

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
        activeHref={"/marketplace-product"}
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
        <h1 className="text-3xl font-bold tracking-tight">Produk Toko</h1>
        {selectedStore ? (
          <p className="text-gray-500 mt-1">
            {selectedStore.name} · {capitalize(selectedStore.category)} · {selectedStore.distanceKm}km
          </p>
        ) : (
          <p className="text-gray-500 mt-1">Silakan pilih toko dari halaman Marketplace.</p>
        )}

        {/* Pencarian & Sort */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="">Urutkan</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
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
              setSortBy("");
            }}
            className="text-sm text-orange-600 hover:underline"
          >
            Reset filter
          </button>
        </div>

  {/* Overlay untuk expandable card */}
        <AnimatePresence>
          {active && typeof active === "object" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 h-full w-full z-10"
            />
          )}
        </AnimatePresence>

        {/* Modal detail */}
        <AnimatePresence>
          {active && typeof active === "object" ? (
            <div className="fixed inset-0 grid place-items-center z-[100]">
              <motion.button
                key={`button-${active.name}-${id}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.05 } }}
                className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-8 w-8"
                onClick={() => setActive(null)}
                aria-label="Tutup"
              >
                <CloseIcon />
              </motion.button>
              <motion.div
                layoutId={`card-${active.id}-${id}`}
                ref={ref}
                className="w-full max-w-[520px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
              >
                <motion.div layoutId={`image-${active.id}-${id}`}>
                  <img
                    width={200}
                    height={200}
                    src={active.imageUrl}
                    alt={active.name}
                    className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-center"
                  />
                </motion.div>

                <div>
                  <div className="flex justify-between items-start p-4">
                    <div>
                      <motion.h3
                        layoutId={`title-${active.id}-${id}`}
                        className="font-semibold text-neutral-800 dark:text-neutral-200 text-lg"
                      >
                        {active.name}
                      </motion.h3>
                      <motion.p
                        layoutId={`description-${active.id}-${id}`}
                        className="text-neutral-600 dark:text-neutral-400 text-sm"
                      >
                        {active.description}
                      </motion.p>
                      <div className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <p>
                          Harga: Rp{(active.price * 1000).toLocaleString("id-ID")}
                        </p>
                        <p>
                          Jarak: {active.distanceKm}km · Kategori: {capitalize(active.category)}
                        </p>
                        {active.address && <p>Alamat: {active.address}</p>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-4 py-3 text-sm rounded-full font-bold bg-[#ff2000] hover:bg-[#C92C0D] text-white"
                      >
                        Pesan
                      </motion.button>
                      <motion.button
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActive(null)}
                        className="px-4 py-3 text-sm rounded-full font-bold bg-gray-100 hover:bg-gray-200 text-black"
                      >
                        Tutup
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>

        {/* List menggunakan expandable standard: preview hanya nama, foto, harga */}
        <ul className="mt-6 max-w-3xl mx-auto w-full gap-4">
          {!selectedStore ? (
            <li className="text-center text-gray-500 py-16">
              Belum ada toko terpilih.
            </li>
          ) : pageItems.length === 0 ? (
            <li className="text-center text-gray-500 py-16">Tidak ada produk yang cocok.</li>
          ) : (
            pageItems.map((item) => (
              <motion.li
                layoutId={`card-${item.id}-${id}`}
                key={`card-${item.id}`}
                onClick={() => setActive(item)}
                className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer border border-gray-200"
              >
                <div className="flex gap-4 flex-col md:flex-row items-center">
                  <motion.div layoutId={`image-${item.id}-${id}`}>
                    <img
                      width={100}
                      height={100}
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-40 w-40 md:h-20 md:w-20 rounded-lg object-cover object-center"
                    />
                  </motion.div>
                  <div>
                    <motion.h3
                      layoutId={`title-${item.id}-${id}`}
                      className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                    >
                      {item.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${item.id}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                    >
                      Rp{(item.price * 1000).toLocaleString("id-ID")}
                    </motion.p>
                  </div>
                </div>
                <motion.button
                  layout
                  className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-[#ff2000] hover:text-white text-black mt-4 md:mt-0"
                >
                  Lihat Detail
                </motion.button>
              </motion.li>
            ))
          )}
        </ul>

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
              const activePage = idx === currentPage;
              return (
                <button
                  key={idx}
                  onClick={() => setPage(idx)}
                  className={
                    "h-9 w-9 rounded-md border text-sm " +
                    (activePage
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

function CloseIcon() {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
}

function capitalize<T extends string>(s: T): Capitalize<T> {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<T>;
}

// Helpers
function createProductsForStore(store: Store): Product[] {
  // Mock: generate 6 products using store context
  const baseNames: Record<Category, string[]> = {
    fashion: ["Batik Tulis", "Kemeja Tenun", "Outer Tenun", "Sarung Songket", "Kain Lurik", "Blouse Batik"],
    kuliner: ["Keripik Pedas", "Kue Lapis", "Kopi Robusta", "Nasi Box", "Rendang Vacum", "Sambal Roa"],
    kerajinan: ["Tas Rajut", "Gantungan Kunci", "Dompet Anyam", "Vas Gerabah", "Kalung Manik", "Totebag Rajut"],
    usaha: ["Cuci Sepatu Reguler", "Deep Clean", "Repaint Sepatu", "Laundry Kecil", "Laundry Besar", "Fast Clean"],
    lainnya: ["Biji Kopi", "Madu Hutan", "Teh Herbal", "Lilin Aromaterapi", "Sabun Alami", "Minyak Kelapa"],
  };

  const names = baseNames[store.category];
  return names.map((n, idx) => {
    const price = 20 + idx * 10; // ribuan (fixed)
    return {
      id: `${store.id}-${idx + 1}`,
      storeId: store.id,
      name: n,
      category: store.category,
      price,
      imageUrl: store.imageUrl,
      description: store.description,
      distanceKm: store.distanceKm,
      address: store.address,
    } as Product;
  });
}
