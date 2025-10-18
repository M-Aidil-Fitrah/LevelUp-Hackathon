"use client";

import { useEffect, useMemo, useId, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import PillNav from "@/components/PillNav";
import { Footer } from "@/components/Footer";
import { useOutsideClick } from "@/hooks/use-outside-click";

const API_URL = 'https://levelup-backend-production-839e.up.railway.app/api';

type Umkm = {
  _id: string;
  nama_umkm: string;
  alamat: string;
  latitude?: number;
  longitude?: number;
  thumbnail?: string;
  caption?: string;
  category_id?: {
    _id: string;
    nama_kategori: string;
  };
};

type Product = {
  _id: string;
  umkm_id: string | Umkm;
  nama_product: string;
  harga: number;
  thumbnail?: string;
  deskripsi_produk?: string;
  created_at: string;
  updated_at: string;
};

type SortBy = "price-asc" | "price-desc" | "name-asc" | "";

export default function MarketplaceProduct() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // State untuk data dari backend
  const [selectedUmkm, setSelectedUmkm] = useState<Umkm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State dan id untuk expandable cards
  const [active, setActive] = useState<Product | boolean | null>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  
  // Get UMKM ID from URL params
  const { id: umkmId } = useParams<{ id: string }>();

  // Fetch UMKM dan produk dari backend
  useEffect(() => {
    if (!umkmId) {
      setSelectedUmkm(null);
      setProducts([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch UMKM detail
        const umkmResponse = await fetch(`${API_URL}/umkm/${umkmId}`);
        const umkmData = await umkmResponse.json();
        
        if (umkmData.status === 200 && umkmData.data) {
          setSelectedUmkm(umkmData.data);
        } else {
          throw new Error('UMKM tidak ditemukan');
        }

        // Fetch all products and filter by umkm_id
        const productsResponse = await fetch(`${API_URL}/product/all`);
        const productsData = await productsResponse.json();
        
        if (productsData.status === 200 && productsData.data) {
          // Filter products untuk UMKM ini
          const filteredProducts = productsData.data.filter((p: Product) => {
            const pUmkmId = typeof p.umkm_id === 'string' ? p.umkm_id : p.umkm_id?._id;
            return pUmkmId === umkmId;
          });
          setProducts(filteredProducts);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Gagal memuat data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [umkmId]);

  // Filter + sort produk
  const filtered = useMemo(() => {
    let items = products.filter((item) => {
      const q = search.trim().toLowerCase();
      const bySearch =
        !q ||
        item.nama_product.toLowerCase().includes(q) ||
        (item.deskripsi_produk?.toLowerCase().includes(q) ?? false);
      return bySearch;
    });

    switch (sortBy) {
      case "price-asc":
        items = items.sort((a, b) => a.harga - b.harga);
        break;
      case "price-desc":
        items = items.sort((a, b) => b.harga - a.harga);
        break;
      case "name-asc":
        items = items.sort((a, b) => a.nama_product.localeCompare(b.nama_product));
        break;
      default:
        break;
    }
    return items;
  }, [search, sortBy, products]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, umkmId]);

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
        {loading ? (
          <p className="text-gray-500 mt-1">Memuat data...</p>
        ) : error ? (
          <p className="text-red-500 mt-1">{error}</p>
        ) : selectedUmkm ? (
          <div className="mt-2">
            <p className="text-xl font-semibold">{selectedUmkm.nama_umkm}</p>
            <p className="text-gray-500">
              {selectedUmkm.category_id?.nama_kategori || 'Kategori tidak tersedia'}
            </p>
            <p className="text-gray-600 text-sm">{selectedUmkm.alamat}</p>
            {selectedUmkm.caption && (
              <p className="text-gray-600 text-sm mt-1">{selectedUmkm.caption}</p>
            )}
          </div>
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
                key={`button-${active.nama_product}-${id}`}
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
                layoutId={`card-${active._id}-${id}`}
                ref={ref}
                className="w-full max-w-[520px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
              >
                <motion.div layoutId={`image-${active._id}-${id}`}>
                  <img
                    width={200}
                    height={200}
                    src={active.thumbnail || '/assets/images/foto1.png'}
                    alt={active.nama_product}
                    className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-center"
                  />
                </motion.div>

                <div>
                  <div className="flex justify-between items-start p-4">
                    <div>
                      <motion.h3
                        layoutId={`title-${active._id}-${id}`}
                        className="font-semibold text-white text-lg"
                      >
                        {active.nama_product}
                      </motion.h3>
                      <motion.p
                        layoutId={`description-${active._id}-${id}`}
                        className="text-neutral-200 text-sm"
                      >
                        {active.deskripsi_produk || 'Tidak ada deskripsi'}
                      </motion.p>
                      <div className="mt-2 text-sm text-neutral-300">
                        <p>
                          Harga: Rp{active.harga.toLocaleString("id-ID")}
                        </p>
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
        <ul className="mt-6 mx-auto w-full gap-4 max-w-5xl md:max-w-6xl">
          {loading ? (
            <li className="text-center text-gray-500 py-16">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span>Memuat produk...</span>
              </div>
            </li>
          ) : !selectedUmkm ? (
            <li className="text-center text-gray-500 py-16">
              Belum ada toko terpilih. Silakan pilih UMKM dari halaman Marketplace.
            </li>
          ) : pageItems.length === 0 && search ? (
            <li className="text-center text-gray-500 py-16">
              Tidak ada produk yang cocok dengan pencarian "{search}".
            </li>
          ) : pageItems.length === 0 ? (
            <li className="text-center text-gray-500 py-16">
              Toko ini belum memiliki produk.
            </li>
          ) : (
            pageItems.map((item) => (
              <motion.li
                layoutId={`card-${item._id}-${id}`}
                key={`card-${item._id}`}
                onClick={() => setActive(item)}
                className="p-4 flex flex-col md:flex-row justify-between items-center bg-white hover:bg-neutral-100 rounded-xl cursor-pointer border border-gray-200"
              >
                <div className="flex gap-4 flex-col md:flex-row items-center">
                  <motion.div layoutId={`image-${item._id}-${id}`}>
                    <img
                      width={100}
                      height={100}
                      src={item.thumbnail || '/assets/images/foto1.png'}
                      alt={item.nama_product}
                      className="h-40 w-40 md:h-20 md:w-20 rounded-lg object-cover object-center"
                    />
                  </motion.div>
                  <div>
                    <motion.h3
                      layoutId={`title-${item._id}-${id}`}
                      className="font-medium text-neutral-900 text-center md:text-left"
                    >
                      {item.nama_product}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${item._id}-${id}`}
                      className="text-neutral-700 text-center md:text-left"
                    >
                      Rp{item.harga.toLocaleString("id-ID")}
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
