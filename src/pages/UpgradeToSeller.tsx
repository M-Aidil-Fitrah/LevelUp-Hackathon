import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, MapPin, Wallet, BarChart3, ArrowLeft } from 'lucide-react';
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
            if (!token || !API_URL) {
                const msg = !token ? 'Anda belum login' : 'Konfigurasi API_URL belum diatur';
                setError(msg);
                toast.error(msg, { title: 'Kesalahan', duration: 4000 });
                return;
            }

            const payload = {
                fullName,
                storeName,
                email,
                phone,
                storeAddress,
                storeCategory,
                storeDescription,
                documents: {
                    ktp: ktpFile?.name || '',
                    businessId: businessIdFile?.name || ''
                }
            };

            const response = await fetch(`${API_URL}/user/upgrade-to-seller`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result: any = await response.json().catch(() => ({}));

            if (response.ok) {
                if (result?.data?.token) localStorage.setItem('token', result.data.token);
                if (result?.data?.user) localStorage.setItem('user', JSON.stringify(result.data.user));
                window.dispatchEvent(new Event('auth-changed'));
                toast.success('Selamat! Anda sekarang adalah seller', { title: 'Berhasil', duration: 3500 });
                navigate('/');
            } else {
                const msg = result?.message || 'Gagal upgrade ke seller';
                setError(msg);
                toast.error(msg, { title: 'Gagal', duration: 4000 });
            }
        } catch (err: any) {
            const msg = err?.message || 'Terjadi kesalahan tidak terduga';
            setError(msg);
            toast.error(msg, { title: 'Kesalahan', duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-50 flex flex-col">
            {/* Compact Header with Back + Title in one line */}
            <div className="bg-gradient-to-r from-[#FF2000] to-[#ff4520] text-white shrink-0">
                <div className="px-4 md:px-8 py-2 md:py-2.5 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-sm"
                        aria-label="Kembali ke Home"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Kembali</span>
                    </button>
                    <h1 className="text-sm md:text-base font-semibold tracking-wide">Verifikasi Menjadi Seller</h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden px-4 md:px-8 py-2 md:py-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                    {/* Right: Form */}
                    <div className="order-2 md:order-2 flex flex-col h-full">
                        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Data Seller & Toko</h2>
                        <div className="grid grid-cols-1 gap-3 flex-1 overflow-hidden">
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nama lengkap sesuai KTP"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    placeholder="Contoh: Toko Keripik Bu Sari"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@contoh.com"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">No. HP</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Alamat Toko</label>
                                <textarea
                                    value={storeAddress}
                                    onChange={(e) => setStoreAddress(e.target.value)}
                                    rows={2}
                                    placeholder="Tulis alamat lengkap toko"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Kartu Identitas (KTP)</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setKtpFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                        required
                                    />
                                    {ktpFile && (
                                        <p className="mt-1 text-[11px] text-gray-500">File: {ktpFile.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Identitas Usaha (NIB/SIUP)</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setBusinessIdFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                        required
                                    />
                                    {businessIdFile && (
                                        <p className="mt-1 text-[11px] text-gray-500">File: {businessIdFile.name}</p>
                                    )}
                                </div>
                            </div>
                            {/* Kategori + Deskripsi in one row to save vertical space */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Kategori Toko</label>
                                    <select
                                        value={storeCategory}
                                        onChange={(e) => setStoreCategory(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
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
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Deskripsi Toko</label>
                                    <textarea
                                        value={storeDescription}
                                        onChange={(e) => setStoreDescription(e.target.value)}
                                        rows={2}
                                        placeholder="Ceritakan tentang toko dan produk yang dijual"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF2000]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Agreement Checkbox */}
                        <div className="flex items-start gap-3 mt-3">
                            <input
                                type="checkbox"
                                id="agree"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF2000] focus:ring-[#FF2000]"
                            />
                            <label htmlFor="agree" className="text-xs md:text-sm text-gray-700 cursor-pointer">
                                Saya menyetujui semua syarat dan ketentuan yang berlaku dan siap untuk menjadi seller
                            </label>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-3">
                                {error}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-2.5">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 px-5 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition text-sm"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleUpgrade}
                                disabled={!agreed || loading}
                                className="flex-1 px-5 py-2.5 bg-[#FF2000] text-white rounded-lg font-semibold hover:brightness-95 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm"
                            >
                                {loading ? 'Memproses...' : 'Verifikasi Sekarang'}
                            </button>
                        </div>
                    </div>

                    {/* Left: Benefits & Terms */}
                    <div className="order-1 md:order-1 space-y-3 h-full overflow-hidden">
                        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-1.5 md:mb-2">
                            Keuntungan Menjadi Seller
                        </h2>
                        <div className="space-y-1.5">
                            {[
                                { Icon: Store, title: "Daftarkan UMKM Anda", desc: "Tampilkan informasi lengkap tentang usaha Anda" },
                                { Icon: Package, title: "Kelola Produk", desc: "Upload dan kelola produk yang Anda jual" },
                                { Icon: MapPin, title: "Muncul di Map", desc: "Lokasi UMKM Anda akan muncul di peta untuk pembeli terdekat" },
                                { Icon: Wallet, title: "Terima Pembayaran", desc: "Sistem pembayaran terintegrasi dengan Midtrans" },
                                { Icon: BarChart3, title: "Dashboard Penjualan", desc: "Pantau performa penjualan Anda secara real-time" },
                            ].map(({ Icon, title, desc }, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-1.5 md:p-2 rounded-lg hover:bg-gray-50 transition">
                                    <Icon className="h-5 w-5 text-[#FF2000]" aria-hidden="true" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{title}</h3>
                                        <p className="text-xs md:text-sm text-gray-600 leading-snug">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 md:p-3 mt-2 md:mt-3">
                            <h3 className="font-semibold text-gray-900 mb-1.5 md:mb-2 text-sm md:text-base">Syarat dan Ketentuan</h3>
                            <ul className="text-xs md:text-sm text-gray-600 space-y-1 list-disc list-inside">
                                <li>Anda harus memiliki UMKM yang legal</li>
                                <li>Produk yang dijual harus sesuai dengan kategori yang tersedia</li>
                                <li>Tidak menjual barang ilegal atau melanggar hukum</li>
                                <li>Bertanggung jawab atas kualitas produk yang dijual</li>
                                <li>Menjaga reputasi dan pelayanan yang baik</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}