import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, MapPin, Wallet, BarChart3, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Category {
    _id: string;
    nama_kategori: string;
}

// Map click handler component
function LocationMarker({ 
    position, 
    setPosition, 
    setAddress 
}: { 
    position: [number, number] | null;
    setPosition: (pos: [number, number]) => void;
    setAddress: (addr: string) => void;
}) {
    useMapEvents({
        click(e) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setPosition(newPos);
            
            // Reverse geocoding using Nominatim
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
                .then(res => res.json())
                .then(data => {
                    if (data.display_name) {
                        setAddress(data.display_name);
                    }
                })
                .catch(err => console.error('Geocoding error:', err));
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function UpgradeToSeller() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);
    const { toast } = useToast();

    const API_URL = 'https://levelup-backend-production-839e.up.railway.app/api';

    // Form state - Personal Info
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    
    // Form state - UMKM Info
    const [namaUmkm, setNamaUmkm] = useState("");
    const [caption, setCaption] = useState("");
    const [alamat, setAlamat] = useState("");
    const [categoryId, setCategoryId] = useState("");
    
    // Location state
    const [mapPosition, setMapPosition] = useState<[number, number]>([5.5418, 95.3413]); // Default: Banda Aceh
    const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
    
    // Files
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [businessPermitFile, setBusinessPermitFile] = useState<File | null>(null);
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    
    // Categories
    const [categories, setCategories] = useState<Category[]>([]);

    // Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setMapPosition(pos);
                    setMarkerPosition(pos);
                    
                    // Get address from coordinates
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos[0]}&lon=${pos[1]}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.display_name) {
                                setAlamat(data.display_name);
                            }
                        })
                        .catch(err => console.error('Geocoding error:', err));
                },
                (error) => {
                    console.error('Geolocation error:', error);
                }
            );
        }
    }, []);

    // Fetch categories
    useEffect(() => {
        fetch(`${API_URL}/category/all`)
            .then(res => res.json())
            .then(result => {
                if (result.data) {
                    setCategories(result.data);
                }
            })
            .catch(err => console.error('Error fetching categories:', err));
    }, []);

    const handleMapClick = (newPos: [number, number]) => {
        setMarkerPosition(newPos);
    };

    const handleAddressFromMap = (addr: string) => {
        setAlamat(addr);
    };

    const handleUpgrade = async () => {
        if (!agreed) {
            const msg = "Anda harus menyetujui syarat dan ketentuan";
            setError(msg);
            toast.error(msg, { title: 'Validasi', duration: 3500 });
            return;
        }

        // Validation
        if (!fullName || !email || !phone || !namaUmkm || !alamat || !categoryId || !markerPosition || !idCardFile || !businessPermitFile) {
            const msg = "Mohon lengkapi semua data dan pilih lokasi di peta";
            setError(msg);
            toast.error(msg, { title: 'Validasi', duration: 4000 });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const msg = "Format email tidak valid";
            setError(msg);
            toast.error(msg, { title: 'Validasi', duration: 3500 });
            return;
        }

        // Phone validation
        if (!/^08\d{8,11}$/.test(phone)) {
            const msg = "Nomor HP harus diawali 08 dan 10-13 digit";
            setError(msg);
            toast.error(msg, { title: 'Validasi', duration: 3500 });
            return;
        }

           try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            const msg = 'Anda belum login. Silakan login terlebih dahulu';
            setError(msg);
            toast.error(msg, { title: 'Kesalahan', duration: 4000 });
            navigate('/login');
            return;
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('nama_umkm', namaUmkm);
        formData.append('caption', caption);
        formData.append('latitude', markerPosition[0].toString());
        formData.append('longitude', markerPosition[1].toString());
        formData.append('alamat', alamat);
        formData.append('category_id', categoryId);
        formData.append('id_card', idCardFile);
        formData.append('business_permit', businessPermitFile);
        if (fotoFile) {
            formData.append('foto', fotoFile);
        }

        console.log('📤 Sending verification request...');
        console.log('📤 URL:', `${API_URL}/seller-verification/request`);
        console.log('📤 Token:', token.substring(0, 20) + '...');

        const response = await fetch(`${API_URL}/seller-verification/request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('❌ Non-JSON response:', textResponse);
            throw new Error('Server mengembalikan response yang tidak valid. Cek console untuk detail.');
        }

        const result = await response.json();
        console.log('📦 Response:', result);

        if (response.ok) {
            toast.success('Permintaan verifikasi berhasil! UMKM Anda akan dibuat setelah disetujui admin.', { 
                title: 'Berhasil', 
                duration: 5000 
            });
            navigate('/');
        } else {
            const msg = result?.message || 'Gagal mengirim permintaan verifikasi';
            setError(msg);
            toast.error(msg, { title: 'Gagal', duration: 4000 });
        }
    } catch (err: any) {
        console.error('❌ Error:', err);
        const msg = err?.message || 'Terjadi kesalahan tidak terduga';
        setError(msg);
        toast.error(msg, { title: 'Kesalahan', duration: 4000 });
    } finally {
        setLoading(false);
    }
};
    return (
        <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FF2000] to-[#ff4520] text-white shrink-0">
                <div className="px-4 md:px-8 py-2 md:py-2.5 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Kembali</span>
                    </button>
                    <h1 className="text-sm md:text-base font-semibold">Verifikasi Seller + Daftar UMKM</h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto px-4 md:px-8 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Benefits */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Keuntungan Menjadi Seller</h2>
                        <div className="space-y-2">
                            {[
                                { Icon: Store, title: "UMKM Otomatis Terdaftar", desc: "Setelah disetujui, UMKM langsung tampil di marketplace" },
                                { Icon: Package, title: "Kelola Produk", desc: "Upload dan kelola produk yang dijual" },
                                { Icon: MapPin, title: "Muncul di Map", desc: "Lokasi UMKM terlihat pembeli terdekat" },
                                { Icon: Wallet, title: "Terima Pembayaran", desc: "Integrasi Midtrans" },
                                { Icon: BarChart3, title: "Dashboard", desc: "Monitor penjualan real-time" },
                            ].map(({ Icon, title, desc }, idx) => (
                                <div key={idx} className="flex gap-3 p-3 rounded-lg hover:bg-gray-100">
                                    <Icon className="h-5 w-5 text-[#FF2000] shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-sm">{title}</h3>
                                        <p className="text-xs text-gray-600">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 text-sm">Syarat dan Ketentuan</h3>
                            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                                <li>Harus memiliki UMKM legal</li>
                                <li>Produk sesuai kategori</li>
                                <li>Tidak jual barang ilegal</li>
                                <li>Menjaga kualitas produk</li>
                                <li>Verifikasi diproses 1-3 hari kerja</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Data Seller & UMKM</h2>
                        
                        {/* Personal Info */}
                        <div className="bg-white p-4 rounded-lg border space-y-3">
                            <h3 className="font-semibold text-sm">Informasi Pribadi</h3>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Nama Lengkap (sesuai KTP)"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF2000] outline-none"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF2000] outline-none"
                                />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF2000] outline-none"
                                />
                            </div>
                        </div>

                        {/* UMKM Info */}
                        <div className="bg-white p-4 rounded-lg border space-y-3">
                            <h3 className="font-semibold text-sm">Informasi UMKM</h3>
                            <input
                                type="text"
                                value={namaUmkm}
                                onChange={(e) => setNamaUmkm(e.target.value)}
                                placeholder="Nama UMKM (Contoh: Warung Kopi Banda)"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF2000] outline-none"
                            />
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                rows={2}
                                placeholder="Deskripsi singkat UMKM (opsional)"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF2000] outline-none"
                            />
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF2000] outline-none"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.nama_kategori}</option>
                                ))}
                            </select>
                        </div>

                        {/* Map Picker */}
                        <div className="bg-white p-4 rounded-lg border space-y-3">
                            <h3 className="font-semibold text-sm">Lokasi UMKM (Klik di Peta)</h3>
                            <div className="h-64 rounded-lg overflow-hidden border">
                                <MapContainer
                                    center={mapPosition}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    <LocationMarker 
                                        position={markerPosition} 
                                        setPosition={handleMapClick}
                                        setAddress={handleAddressFromMap}
                                    />
                                </MapContainer>
                            </div>
                            {markerPosition && (
                                <div className="text-xs bg-green-50 p-2 rounded border border-green-200">
                                    <p className="font-medium text-green-800">📍 Lokasi dipilih:</p>
                                    <p className="text-green-700">Lat: {markerPosition[0].toFixed(6)}, Lng: {markerPosition[1].toFixed(6)}</p>
                                </div>
                            )}
                            <textarea
                                value={alamat}
                                onChange={(e) => setAlamat(e.target.value)}
                                rows={2}
                                placeholder="Alamat lengkap UMKM"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#FF2000] outline-none"
                            />
                        </div>

                        {/* Documents */}
                        <div className="bg-white p-4 rounded-lg border space-y-3">
                            <h3 className="font-semibold text-sm">Dokumen & Foto</h3>
                            <div>
                                <label className="block text-xs font-medium mb-1">KTP *</label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
                                />
                                {idCardFile && <p className="text-[10px] text-green-600 mt-1">✓ {idCardFile.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Izin Usaha (NIB/SIUP) *</label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setBusinessPermitFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
                                />
                                {businessPermitFile && <p className="text-[10px] text-green-600 mt-1">✓ {businessPermitFile.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">Foto UMKM (Opsional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700"
                                />
                                {fotoFile && <p className="text-[10px] text-green-600 mt-1">✓ {fotoFile.name}</p>}
                            </div>
                        </div>

                        {/* Agreement */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="agree"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF2000] focus:ring-[#FF2000]"
                            />
                            <label htmlFor="agree" className="text-xs text-gray-700 cursor-pointer">
                                Saya menyetujui semua syarat dan ketentuan. Data yang saya berikan adalah benar.
                            </label>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/')}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 border rounded-lg font-semibold text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpgrade}
                                disabled={!agreed || loading}
                                className="flex-1 px-4 py-2.5 bg-[#FF2000] text-white rounded-lg font-semibold text-sm hover:brightness-95 disabled:bg-gray-300"
                            >
                                {loading ? 'Mengirim...' : 'Kirim Verifikasi'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}