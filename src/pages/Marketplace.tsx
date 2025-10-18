"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover";
import PillNav from "@/components/PillNav";
import { Footer } from "@/components/Footer";

interface Category {
  _id: string;
  nama_kategori: string;
}

interface Umkm {
  _id: string;
  nama_umkm: string;
  thumbnail: string;
  alamat: string;
  kategori: string;
  kategori_id?: string;
  priceRange: string;
  distance: string | null;
  latitude: number;
  longitude: number;
}

type SortBy = "price-asc" | "price-desc" | "distance" | "name-asc" | "";

export default function Marketplace() {
  const [umkms, setUmkms] = useState<Umkm[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("");
  const [page, setPage] = useState(1);
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const pageSize = 9;
  const API_URL = 'https://levelup-backend-production-839e.up.railway.app/api';

  // Request location permission on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch UMKMs when location is available or permission denied
  useEffect(() => {
    if (userLocation || locationPermission === 'denied') {
      fetchUmkms();
    }
  }, [userLocation, locationPermission]);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setError('Browser Anda tidak mendukung geolocation');
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('✅ Location granted:', location);
        setUserLocation(location);
        setLocationPermission('granted');
        setError(null);
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Izin lokasi ditolak. Anda tetap bisa melihat UMKM, tapi tanpa informasi jarak.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Lokasi tidak tersedia. Mencoba mengambil data tanpa lokasi...');
            break;
          case error.TIMEOUT:
            setError('Request lokasi timeout. Mencoba lagi...');
            setTimeout(requestLocationPermission, 3000);
            return;
        }
        setLocationPermission('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/category/all`);
      const result = await response.json();
      
      console.log('📂 Categories response:', result);
      
      if (response.ok && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    }
  };

  const fetchUmkms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_URL}/umkm/all`;
      if (userLocation) {
        url += `?latitude=${userLocation.lat}&longitude=${userLocation.lng}`;
      }

      console.log('🔍 Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('📦 API Result:', result);
      console.log('📦 Data length:', result.data?.length);

      if (result.status === 200 && result.data) {
        setUmkms(result.data);
        
        if (result.data.length === 0) {
          setError('Belum ada UMKM terdaftar');
        }
      } else {
        setError(result.message || 'Gagal memuat data UMKM');
      }
    } catch (err: any) {
      console.error('❌ Error fetching UMKMs:', err);
      setError(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLocation = () => {
    setError(null);
    setLocationPermission('prompt');
    requestLocationPermission();
  };

  // Filter + sort memoized
  const filtered = useMemo(() => {
    let items = [...umkms];

    // Filter by category
    if (selectedCategory !== "all") {
      items = items.filter(item => item.kategori_id === selectedCategory);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(item =>
        item.nama_umkm.toLowerCase().includes(q) ||
        item.alamat.toLowerCase().includes(q) ||
        (item.kategori && item.kategori.toLowerCase().includes(q))
      );
    }

    // Sort items
    switch (sortBy) {
      case "price-asc":
        items.sort((a, b) => extractMinPrice(a.priceRange) - extractMinPrice(b.priceRange));
        break;
      case "price-desc":
        items.sort((a, b) => extractMaxPrice(b.priceRange) - extractMaxPrice(a.priceRange));
        break;
      case "distance":
        if (userLocation) {
          items.sort((a, b) => {
            const distA = parseFloat(a.distance || "999999");
            const distB = parseFloat(b.distance || "999999");
            return distA - distB;
          });
        }
        break;
      case "name-asc":
        items.sort((a, b) => a.nama_umkm.localeCompare(b.nama_umkm));
        break;
    }
    
    return items;
  }, [umkms, selectedCategory, search, sortBy, userLocation]);

  // Helper functions
  const extractMinPrice = (priceRange: string): number => {
    if (priceRange === "Belum ada produk") return 0;
    const match = priceRange.match(/Rp\s*([\d.,]+)/);
    if (match) {
      return parseInt(match[1].replace(/\./g, '').replace(/,/g, ''));
    }
    return 0;
  };

  const extractMaxPrice = (priceRange: string): number => {
    if (priceRange === "Belum ada produk") return 0;
    const matches = priceRange.match(/Rp\s*([\d.,]+)/g);
    if (matches && matches.length > 1) {
      return parseInt(matches[1].replace(/[Rp\s.,]/g, ''));
    } else if (matches) {
      return parseInt(matches[0].replace(/[Rp\s.,]/g, ''));
    }
    return 0;
  };

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, search, sortBy]);

  // Loading state
  if (loading && !umkms.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF2000] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {userLocation ? 'Memuat UMKM terdekat...' : 'Mendapatkan lokasi Anda...'}
          </p>
        </div>
      </div>
    );
  }

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

      {/* Spacer */}
      <div className="h-16 md:h-20" />

      <div className="mx-auto max-w-7xl px-4 pb-8">
        {/* Location Permission Banner */}
        {locationPermission === 'denied' && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-yellow-700">
                  Aktifkan lokasi untuk melihat jarak UMKM dari Anda dan mendapatkan rekomendasi terdekat
                </p>
              </div>
              <button
                onClick={handleRetryLocation}
                className="ml-4 flex-shrink-0 bg-yellow-400 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-500 transition"
              >
                Aktifkan Lokasi
              </button>
            </div>
          </div>
        )}

        {/* Location Status */}
        {userLocation && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-green-700">
                Lokasi terdeteksi • Menampilkan UMKM berdasarkan jarak terdekat
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && locationPermission !== 'denied' && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Header */}
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-gray-500 mt-1">
          {userLocation 
            ? `Jelajahi ${umkms.length} Toko UMKM di sekitarmu`
            : `Jelajahi ${umkms.length} Toko UMKM`
          }
        </p>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari UMKM, alamat, atau kategori..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.nama_kategori}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <div>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <option value="">Urutkan</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              {userLocation && <option value="distance">Jarak Terdekat</option>}
              <option value="name-asc">Nama A-Z</option>
            </select>
          </div>
        </div>

        {/* Counter and reset */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Menampilkan {pageItems.length} dari {filtered.length} UMKM
          </span>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
              setSortBy("");
            }}
            className="text-sm text-[#FF2000] hover:underline"
          >
            Reset filter
          </button>
        </div>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-16">
              {umkms.length === 0 ? (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p>Belum ada UMKM terdaftar</p>
                  <p className="text-sm mt-2">Daftar sebagai seller untuk menambahkan UMKM Anda</p>
                </>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>Tidak ada UMKM yang cocok dengan pencarian</p>
                </>
              )}
            </div>
          ) : (
            pageItems.map((item) => (
              <Link key={item._id} to={`/marketplace/${item._id}`} className="block">
                <DirectionAwareHover
                  imageUrl={item.thumbnail || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                  className="w-full h-64 md:h-80"
                  showTextAlways={true}
                  childrenClassName="text-white absolute bottom-4 left-4 z-40 px-3 py-2 rounded-md shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-lg line-clamp-1">{item.nama_umkm}</p>
                    <p className="text-sm line-clamp-1">
                      {item.priceRange}
                      {item.distance && ` • ${item.distance}`}
                      {` • ${item.kategori}`}
                    </p>
                    <p className="text-xs mt-1 line-clamp-1 opacity-90">
                      📍 {item.alamat}
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
              className="px-3 py-2 rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
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
                    "h-9 w-9 rounded-md border text-sm transition " +
                    (active
                      ? "bg-[#FF2000] text-white border-[#FF2000]"
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
              className="px-3 py-2 rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50 transition"
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