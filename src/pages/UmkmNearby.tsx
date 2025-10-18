import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useOutsideClick } from '../hooks/use-outside-click';
import { Search, Store, MapPin, Tag, ChevronLeft, ChevronRight, X } from 'lucide-react';

// We will provide explicit icons for all markers to avoid default icon path issues.

interface Category {
  _id: string;
  nama_kategori: string;
}

interface Umkm {
  _id: string;
  nama_umkm: string;
  thumbnail?: string;
  alamat: string;
  kategori?: string;
  kategori_id?: string;
  latitude: number;
  longitude: number;
}

const API_URL = 'https://levelup-backend-production-839e.up.railway.app/api';

// Small helper component to capture map click and reset selection
function MapClickResetter({ onReset }: { onReset: () => void }) {
  useMapEvents({
    click: () => onReset(),
  });
  return null;
}

export default function UmkmNearby() {
  const navigate = useNavigate();
  // Location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.5418, 95.3413]); // Banda Aceh default
  const [locationStatus, setLocationStatus] = useState<'granted' | 'denied' | 'pending'>('pending');

  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [umkms, setUmkms] = useState<Umkm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUmkmId, setSelectedUmkmId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState<number>(5); // 0.5 - 10 km
  // Search UI
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  useOutsideClick(searchWrapRef, () => setShowSuggestions(false));
  // Cards carousel state
  const [cardResults, setCardResults] = useState<Umkm[]>([]);
  const [showCards, setShowCards] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Helper: highlight matched query inside a text (case-insensitive)
  const Highlight = ({ text, query, className, strong = false }: { text?: string; query: string; className?: string; strong?: boolean }) => {
    if (!text) return null;
    const q = query.trim();
    if (!q) return <span className={className}>{strong ? <strong className="text-orange-500">{text}</strong> : text}</span>;
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
    const parts = text.split(re);
    return (
      <span className={className}>
        {parts.map((part, idx) =>
          re.test(part)
            ? <strong key={idx} className="text-orange-500">{part}</strong>
            : <span key={idx}>{part}</span>
        )}
      </span>
    );
  };

  // Get user location on mount
  useEffect(() => {
    try {
      if (!navigator.geolocation) {
        setLocationStatus('denied');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
            setUserLocation(loc);
            setMapCenter([loc.lat, loc.lng]);
          }
          setLocationStatus('granted');
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setLocationStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } catch (e) {
      console.warn('Geolocation exception:', e);
      setLocationStatus('denied');
    }
  }, []);

  // Allowed categories (by name)
  const allowedCategoryNames = useMemo(() => [
    'Makanan & Minuman',
    'Fashion & Pakaian',
    'Kerajinan Tangan',
    'Elektronik',
    'Jasa & Layanan',
  ], []);

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/category/all`);
        const json = await res.json();
        if (json?.data) setCategories(json.data);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    })();
  }, []);

  // Fetch UMKMs
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        let url = `${API_URL}/umkm/all`;
        if (userLocation) {
          url += `?latitude=${userLocation.lat}&longitude=${userLocation.lng}`;
        }
        const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const itemsRaw: Umkm[] = json?.data || [];
        // Normalize coords to numbers and drop items missing coords
        const items: Umkm[] = itemsRaw
          .map((i) => ({
            ...i,
            latitude: typeof i.latitude === 'string' ? parseFloat(i.latitude as unknown as string) : i.latitude,
            longitude: typeof i.longitude === 'string' ? parseFloat(i.longitude as unknown as string) : i.longitude,
          }))
          .filter((i) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude));
        setUmkms(items);
      } catch (e: any) {
        console.error('Error fetching umkms:', e);
        setError(e?.message || 'Gagal memuat data UMKM');
      } finally {
        setLoading(false);
      }
    })();
  }, [userLocation]);

  // Custom icons
  const blueIcon = useMemo(() =>
    new L.Icon({
      iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    []
  );

  const greenIcon = useMemo(() =>
    new L.Icon({
      iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    []
  );

  const redIcon = useMemo(() =>
    new L.Icon({
      iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    []
  );

  // Build category names to show (restricted to allowed list, fallback to static if API missing)
  const categoryNamesToShow = useMemo(() => {
    const namesFromApi = categories.map(c => c.nama_kategori).filter(Boolean);
    const filtered = allowedCategoryNames.filter(name => namesFromApi.includes(name));
    return (filtered.length ? filtered : allowedCategoryNames);
  }, [categories, allowedCategoryNames]);

  // Suggestions based on search text
  type Suggestion =
    | { type: 'umkm'; id: string; label: string; lat: number; lng: number; alamat?: string; kategori?: string }
    | { type: 'kategori'; id: string; label: string };

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    // UMKM matched by name
    const byName: Suggestion[] = umkms
      .filter((i) => i.nama_umkm.toLowerCase().includes(q))
      .slice(0, 10)
      .map((i) => ({ type: 'umkm', id: i._id, label: i.nama_umkm, lat: i.latitude, lng: i.longitude, alamat: i.alamat, kategori: i.kategori }));

    // UMKM matched by address (still return as umkm suggestion)
    const byAddr: Suggestion[] = [];
    const seen = new Set(byName.map((s) => s.id));
    for (const i of umkms) {
      const addr = i.alamat?.trim();
      if (!addr) continue;
      if (addr.toLowerCase().includes(q) && !seen.has(i._id)) {
        seen.add(i._id);
        byAddr.push({ type: 'umkm', id: i._id, label: i.nama_umkm, lat: i.latitude, lng: i.longitude, alamat: i.alamat, kategori: i.kategori });
        if (byAddr.length >= 10) break;
      }
    }

    const catMatches: Suggestion[] = categoryNamesToShow
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, 10)
      .map((name) => ({ type: 'kategori', id: name, label: name }));

    // Prioritize UMKM, then addresses, then categories
    return [...byName, ...byAddr, ...catMatches].slice(0, 12);
  }, [search, umkms, categories]);

  function handlePickSuggestion(s: Suggestion) {
    if (s.type === 'umkm') {
      setSearch(s.label);
      setSelectedUmkmId(s.id);
      setFlyTarget([s.lat, s.lng]);
      setShowSuggestions(false);
      setShowCards(false);
    } else if (s.type === 'kategori') {
      setSelectedCategory(s.id);
      setShowSuggestions(false);
      setShowCards(false);
    }
  }

  function handleSubmitSearch() {
    const q = search.trim().toLowerCase();
    if (!q) {
      setShowCards(false);
      setCardResults([]);
      return;
    }
    // pick top 3 matches by name/address/category
    let pool = umkms.filter((i) => (
      i.nama_umkm.toLowerCase().includes(q) ||
      i.alamat.toLowerCase().includes(q) ||
      (i.kategori && i.kategori.toLowerCase().includes(q))
    ));
    // sort by distance if location is available
    if (userLocation) {
      pool = pool
        .map((i) => ({ i, d: distanceKm(userLocation, { lat: i.latitude, lng: i.longitude }) }))
        .sort((a, b) => a.d - b.d)
        .map((x) => x.i);
    }
    setCardResults(pool.slice(0, 3));
    setShowCards(true);
    setShowSuggestions(false);
  }

  // Distance helper (km)
  const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sa =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
    return R * c;
  };

  // Validate coordinates
  const hasValidCoords = (i: Umkm) => Number.isFinite(i.latitude) && Number.isFinite(i.longitude);

  // Filtered items
  const filtered = useMemo(() => {
    let items = umkms.filter(hasValidCoords);

    if (selectedCategory !== 'all') {
      // Match either by kategori name or kategori_id (supports both API ids and fixed names)
      items = items.filter((i) => i.kategori === selectedCategory || i.kategori_id === selectedCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.nama_umkm.toLowerCase().includes(q) ||
          i.alamat.toLowerCase().includes(q) ||
          (i.kategori && i.kategori.toLowerCase().includes(q))
      );
    }

    if (userLocation) {
      items = items.filter((i) => {
        const d = distanceKm(userLocation, { lat: i.latitude, lng: i.longitude });
        return d <= radiusKm;
      });
    }

    return items;
  }, [umkms, selectedCategory, search, userLocation, radiusKm]);

  // Reset selected marker if it is filtered out
  useEffect(() => {
    if (selectedUmkmId && !filtered.some((i) => i._id === selectedUmkmId)) {
      setSelectedUmkmId(null);
    }
  }, [filtered, selectedUmkmId]);

  if (loading && umkms.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF2000] mx-auto"></div>
          <p className="mt-4 text-gray-600">{locationStatus === 'pending' ? 'Mendapatkan lokasi Anda...' : 'Memuat peta...'}</p>
        </div>
      </div>
    );
  }

  const [lat, lng] = mapCenter;
  const safeCenter: [number, number] = (Number.isFinite(lat) && Number.isFinite(lng))
    ? mapCenter
    : [5.5418, 95.3413];

  // Fly to a position when flyTarget changes
  function MapFlyTo({ position }: { position: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.flyTo(position, 16, { duration: 0.8 });
      }
    }, [position, map]);
    return null;
  }

  return (
    <div className="h-screen w-screen relative bg-white">
      {/* Back to home button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-3 left-16 z-[1100] bg-[#171717] text-white border border-[#2A2A2A] shadow-lg rounded-full px-4 py-2 text-sm hover:brightness-110"
      >
        ← Kembali ke Home
      </button>
      {/* Top filter bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[96%] max-w-5xl">
        <div className="bg-[#171717] backdrop-blur-md border border-[#2A2A2A] shadow-lg rounded-xl p-3 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            {/* Search */}
            <div className="relative md:col-span-1" ref={searchWrapRef}>
              <div className="flex items-center gap-2 bg-[#111111] border border-[#2A2A2A] rounded-full px-4 py-2">
                <Search size={18} className="text-gray-300" />
                <input
                  type="text"
                  placeholder="Cari UMKM, alamat, atau kategori..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmitSearch(); } }}
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-400"
                />
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute mt-2 w-full max-h-72 overflow-auto bg-[#171717] border border-[#2A2A2A] rounded-xl shadow-lg">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePickSuggestion(s)}
                      className="w-full text-left px-4 py-2 hover:bg-[#222] focus:bg-[#222]"
                    >
                      {s.type === 'umkm' ? (
                        <div className="flex items-start gap-3">
                          <Store size={18} className="mt-1 text-gray-300" />
                          <div>
                            <div className="font-semibold text-white">
                              <Highlight text={s.label} query={search} strong />
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-2">
                              <MapPin size={14} /> <Highlight text={s.alamat || '-'} query={search} />
                            </div>
                            {s.kategori && (
                              <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                                <Tag size={14} /> <Highlight text={s.kategori} query={search} />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Tag size={18} className="text-gray-300" />
                          <div>
                            <div className="text-white"><Highlight text={s.label} query={search} strong /></div>
                            <div className="text-xs text-gray-400">Kategori</div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category (restricted to specified list) */}
            <select
              className="w-full rounded-lg bg-[#111111] text-white border border-[#2A2A2A] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {categoryNamesToShow.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Radius */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.5}
                max={10}
                step={0.5}
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                disabled={!userLocation}
                className="flex-1 accent-[#FF2000]"
              />
              <span className="text-sm text-gray-200 whitespace-nowrap">
                {radiusKm.toFixed(1)} km
              </span>
            </div>
          </div>

          {locationStatus === 'denied' && (
            <p className="text-xs text-yellow-400 mt-2">Aktifkan lokasi browser untuk menyaring berdasarkan jarak.</p>
          )}
          {error && (
            <p className="text-xs text-red-400 mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0">
        <MapContainer center={safeCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <MapFlyTo position={flyTarget} />
          {/* Reset selected marker when clicking on empty map */}
          <MapClickResetter onReset={() => setSelectedUmkmId(null)} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* User location marker + radius */}
          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]} icon={greenIcon}>
                <Popup>Lokasi Anda</Popup>
              </Marker>
              <Circle center={[userLocation.lat, userLocation.lng]} radius={radiusKm * 1000} pathOptions={{ color: '#FF2000', fillOpacity: 0.08 }} />
            </>
          )}

          {/* UMKM markers */}
          {filtered.map((i) => {
            const isSelected = selectedUmkmId === i._id;
            return (
              <Marker
                key={i._id}
                position={[i.latitude, i.longitude]}
                icon={isSelected ? redIcon : blueIcon}
                eventHandlers={{
                  click: () => setSelectedUmkmId((prev) => (prev === i._id ? null : i._id)),
                }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-semibold">{i.nama_umkm}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{i.alamat}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Cards Carousel (shown after Enter) */}
      {showCards && cardResults.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 z-[1000] w-[98%] max-w-7xl">
          <div className="bg-[#171717] text-white border border-[#2A2A2A] rounded-xl p-3 shadow-lg relative">
            <button
              onClick={() => setShowCards(false)}
              className="absolute right-3 top-3 p-1 rounded hover:bg-[#222]"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-full hover:bg-[#222]"
                onClick={() => { const c = carouselRef.current; if (c) c.scrollBy({ left: -300, behavior: 'smooth' }); }}
                aria-label="Prev"
              >
                <ChevronLeft />
              </button>
              <div
                ref={carouselRef}
                className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1"
              >
                {cardResults.map((i) => {
                  const imgSrc = i.thumbnail || 'https://placehold.co/400x240?text=UMKM';
                  const distance = userLocation ? distanceKm(userLocation, { lat: i.latitude, lng: i.longitude }) : null;
                  return (
                    <div
                      key={i._id}
                      className="min-w-[320px] snap-center bg-[#111111] border border-[#2A2A2A] rounded-lg overflow-hidden hover:brightness-110"
                    >
                      <button
                        onClick={() => { setSelectedUmkmId(i._id); setFlyTarget([i.latitude, i.longitude]); }}
                        className="block w-full text-left"
                      >
                        <img src={imgSrc} alt={i.nama_umkm} className="w-full h-44 object-cover" />
                        <div className="p-3">
                          <div className="font-semibold text-white mb-1 line-clamp-1">{i.nama_umkm}</div>
                          <div className="text-xs text-gray-400 line-clamp-2">{i.alamat || 'Belum ada deskripsi'}</div>
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-300">
                            <div className="flex items-center gap-1"><Tag size={14} /> {i.kategori || '-'}</div>
                            {distance !== null && (<div>{distance.toFixed(1)} km</div>)}
                          </div>
                        </div>
                      </button>
                      <div className="px-3 pb-3">
                        <button
                          onClick={() => navigate(`/marketplace/${i._id}`)}
                          className="w-full text-sm bg-[#FF2000] hover:brightness-110 text-white rounded-md py-2 transition"
                        >
                          Lihat Toko
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                className="p-2 rounded-full hover:bg-[#222]"
                onClick={() => { const c = carouselRef.current; if (c) c.scrollBy({ left: 300, behavior: 'smooth' }); }}
                aria-label="Next"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Removed bottom badge to allow carousel sit lower */}
    </div>
  );
}
