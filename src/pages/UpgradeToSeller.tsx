import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UpgradeToSeller() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agreed, setAgreed] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleUpgrade = async () => {
        if (!agreed) {
            setError("Anda harus menyetujui syarat dan ketentuan");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError("Anda harus login terlebih dahulu");
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
                
                alert('Selamat! Anda sekarang adalah seller');
                navigate('/register-umkm');
            } else {
                setError(result.message || 'Gagal upgrade ke seller');
            }
        } catch (err) {
            console.error('Error upgrading to seller:', err);
            setError('Terjadi kesalahan saat upgrade ke seller');
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
                            {/* Benefits */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Keuntungan Menjadi Seller
                                </h2>
                                <div className="space-y-3">
                                    {[
                                        {
                                            icon: "🏪",
                                            title: "Daftarkan UMKM Anda",
                                            desc: "Tampilkan informasi lengkap tentang usaha Anda"
                                        },
                                        {
                                            icon: "📦",
                                            title: "Kelola Produk",
                                            desc: "Upload dan kelola produk yang Anda jual"
                                        },
                                        {
                                            icon: "📍",
                                            title: "Muncul di Map",
                                            desc: "Lokasi UMKM Anda akan muncul di peta untuk pembeli terdekat"
                                        },
                                        {
                                            icon: "💰",
                                            title: "Terima Pembayaran",
                                            desc: "Sistem pembayaran terintegrasi dengan Midtrans"
                                        },
                                        {
                                            icon: "📊",
                                            title: "Dashboard Penjualan",
                                            desc: "Pantau performa penjualan Anda secara real-time"
                                        }
                                    ].map((benefit, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                                            <span className="text-2xl">{benefit.icon}</span>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                                                <p className="text-sm text-gray-600">{benefit.desc}</p>
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