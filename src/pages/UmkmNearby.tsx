import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

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
      items = items.filter((i) => i.kategori_id === selectedCategory);
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

  return (
    <div className="h-screen w-screen relative bg-white">
      {/* Back to home button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-3 left-3 z-[1100] bg-white/90 backdrop-blur-md border shadow-lg rounded-full px-4 py-2 text-sm hover:bg-white"
      >
        ← Kembali ke Home
      </button>
      {/* Top filter bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[96%] max-w-5xl">
        <div className="bg-white/90 backdrop-blur-md border shadow-lg rounded-xl p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Cari UMKM, alamat, atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
            />

            {/* Category */}
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.nama_kategori}</option>
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
                className="flex-1"
              />
              <span className="text-sm text-gray-700 whitespace-nowrap">
                {radiusKm.toFixed(1)} km
              </span>
            </div>
          </div>

          {locationStatus === 'denied' && (
            <p className="text-xs text-yellow-700 mt-2">Aktifkan lokasi browser untuk menyaring berdasarkan jarak.</p>
          )}
          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="absolute inset-0">
        <MapContainer center={safeCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
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
                  click: () => setSelectedUmkmId(i._id),
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

      {/* Bottom badge with count */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="bg-white/90 backdrop-blur-md border shadow-lg rounded-full px-4 py-2 text-sm">
          Menampilkan {filtered.length} UMKM
        </div>
      </div>
    </div>
  );
}
