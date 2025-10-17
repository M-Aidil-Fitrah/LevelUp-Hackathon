import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, MapPin, Wallet, BarChart3 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function UpgradeToSeller() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);
    const { toast } = useToast();

    const API_URL = import.meta.env.VITE_API_URL;

    // Form state
    const [fullName, setFullName] = useState("");
    const [storeName, setStoreName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [storeAddress, setStoreAddress] = useState("");
    const [storeCategory, setStoreCategory] = useState("");
    const [storeDescription, setStoreDescription] = useState("");
    const [ktpFile, setKtpFile] = useState<File | null>(null);
    const [businessIdFile, setBusinessIdFile] = useState<File | null>(null);

    const handleUpgrade = async () => {
        if (!agreed) {
            const msg = "Anda harus menyetujui syarat dan ketentuan";
            setError(msg);
            toast.error(msg, { title: 'Validasi', duration: 3500 });
            return;
        }

        // Basic validation for required fields
        if (!fullName || !storeName || !email || !phone || !storeAddress || !storeCategory || !storeDescription || !ktpFile || !businessIdFile) {
            const msg = "Mohon lengkapi semua data dan unggah berkas yang diminta";
            setError(msg);
            toast.error(msg, { title: 'Validasi', duration: 4000 });
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                const msg = "Anda harus login terlebih dahulu";
                setError(msg);
                toast.error(msg, { title: 'Autentikasi', duration: 3500 });
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_URL}/user/upgrade-to-seller`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                // Update localStorage with new user data and token
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                
                // Trigger auth-changed event for components to update
                window.dispatchEvent(new Event('auth-changed'));
                
                toast.success('Selamat! Anda sekarang adalah seller', { title: 'Berhasil', duration: 3500 });
                navigate('/');
            } else {
                const msg = result.message || 'Gagal upgrade ke seller';
                setError(msg);
                toast.error(msg, { title: 'Gagal', duration: 4000 });
            }
        } catch (err) {
            console.error('Error upgrading to seller:', err);
            const msg = 'Terjadi kesalahan saat upgrade ke seller';
            setError(msg);
            toast.error(msg, { title: 'Kesalahan', duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#FF2000] to-[#ff4520] px-8 py-12 text-white">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-12 w-12" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-center mb-2">
                            Verifikasi Menjadi Seller
                        </h1>
                        <p className="text-center text-white/90">
                            Mulai jual produk UMKM Anda dan jangkau lebih banyak pembeli
                        </p>
                    </div>

                    {/* Content */}
                    <div className="px-8 py-8">
                        <div className="space-y-6">
                            {/* Seller Form */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Seller & Toko</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Nama lengkap sesuai KTP"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
                                        <input
                                            type="text"
                                            value={storeName}
                                            onChange={(e) => setStoreName(e.target.value)}
                                            placeholder="Contoh: Toko Keripik Bu Sari"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="email@contoh.com"
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="08xxxxxxxxxx"
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Toko</label>
                                        <textarea
                                            value={storeAddress}
                                            onChange={(e) => setStoreAddress(e.target.value)}
                                            rows={3}
                                            placeholder="Tulis alamat lengkap toko"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kartu Identitas (KTP)</label>
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={(e) => setKtpFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                                required
                                            />
                                            {ktpFile && (
                                                <p className="mt-1 text-xs text-gray-500">File: {ktpFile.name}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Identitas Usaha (NIB/SIUP)</label>
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={(e) => setBusinessIdFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                                required
                                            />
                                            {businessIdFile && (
                                                <p className="mt-1 text-xs text-gray-500">File: {businessIdFile.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Toko</label>
                                            <select
                                                value={storeCategory}
                                                onChange={(e) => setStoreCategory(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                                required
                                            >
                                                <option value="">Pilih Kategori</option>
                                                <option value="kerajinan">Kerajinan</option>
                                                <option value="kuliner">Kuliner</option>
                                                <option value="usaha">Usaha</option>
                                                <option value="fashion">Fashion</option>
                                                <option value="lainnya">Lainnya</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Toko</label>
                                        <textarea
                                            value={storeDescription}
                                            onChange={(e) => setStoreDescription(e.target.value)}
                                            rows={4}
                                            placeholder="Ceritakan tentang toko dan produk yang dijual"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Keuntungan Menjadi Seller
                                </h2>
                                <div className="space-y-3">
                                    {[
                                        { Icon: Store, title: "Daftarkan UMKM Anda", desc: "Tampilkan informasi lengkap tentang usaha Anda" },
                                        { Icon: Package, title: "Kelola Produk", desc: "Upload dan kelola produk yang Anda jual" },
                                        { Icon: MapPin, title: "Muncul di Map", desc: "Lokasi UMKM Anda akan muncul di peta untuk pembeli terdekat" },
                                        { Icon: Wallet, title: "Terima Pembayaran", desc: "Sistem pembayaran terintegrasi dengan Midtrans" },
                                        { Icon: BarChart3, title: "Dashboard Penjualan", desc: "Pantau performa penjualan Anda secara real-time" },
                                    ].map(({ Icon, title, desc }, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                                            <Icon className="h-6 w-6 text-[#FF2000]" aria-hidden="true" />
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{title}</h3>
                                                <p className="text-sm text-gray-600">{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Syarat dan Ketentuan</h3>
                                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                    <li>Anda harus memiliki UMKM yang legal</li>
                                    <li>Produk yang dijual harus sesuai dengan kategori yang tersedia</li>
                                    <li>Tidak menjual barang ilegal atau melanggar hukum</li>
                                    <li>Bertanggung jawab atas kualitas produk yang dijual</li>
                                    <li>Menjaga reputasi dan pelayanan yang baik</li>
                                </ul>
                            </div>

                            {/* Agreement Checkbox */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="agree"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF2000] focus:ring-[#FF2000]"
                                />
                                <label htmlFor="agree" className="text-sm text-gray-700 cursor-pointer">
                                    Saya menyetujui semua syarat dan ketentuan yang berlaku dan siap untuk menjadi seller
                                </label>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate('/')}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleUpgrade}
                                    disabled={!agreed || loading}
                                    className="flex-1 px-6 py-3 bg-[#FF2000] text-white rounded-lg font-semibold hover:brightness-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                >
                                    {loading ? 'Memproses...' : 'Verifikasi Sekarang'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}