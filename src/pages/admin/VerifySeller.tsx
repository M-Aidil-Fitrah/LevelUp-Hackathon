// import { useEffect, useState } from 'react';
// import AdminSidebar from '@/components/admin/AdminSidebar';
// import { loadApplications, saveApplications, type SellerApplication, loadUsers, saveUsers } from '@/lib/adminStorage';
// import { useNavigate } from 'react-router-dom';

// export default function VerifySellerPage() {
//   const navigate = useNavigate();
//   const [apps, setApps] = useState<SellerApplication[]>([]);

//   useEffect(() => { setApps(loadApplications().filter(a => (a.status ?? 'pending') === 'pending')); }, []);


//   const approve = (id: string) => {
//     // Mark application approved and upgrade user role to seller in local users store if exists
//     const nextApps = apps.filter(a => a.id !== id);
//     setApps(nextApps);
//     const all = loadApplications().map(a => (a.id === id ? { ...a, status: 'approved' as const } : a));
//     saveApplications(all);

//     const users = loadUsers();
//     const app = all.find(a => a.id === id);
//     if (app) {
//       const idx = users.findIndex(u => u.email === app.email);
//       if (idx >= 0) users[idx] = { ...users[idx], role: 'seller' };
//       saveUsers(users);
//     }
//   };

//   const reject = (id: string) => {
//     const nextApps = apps.filter(a => a.id !== id);
//     setApps(nextApps);
//     const all = loadApplications().map(a => (a.id === id ? { ...a, status: 'rejected' as const } : a));
//     saveApplications(all);
//   };

//   return (
//     <div className="flex h-screen w-screen overflow-hidden md:flex-row bg-gray-100 dark:bg-neutral-900">
//       <AdminSidebar
//         active="verify"
//         onChange={(next) => {
//           if (next === 'home') navigate('/admin/dashboard');
//           if (next === 'verify') navigate('/admin/verify-seller');
//         }}
//       />
//       <div className="flex flex-1">
//         <div className="flex h-full w-full flex-1 flex-col gap-2 p-3 md:p-8">
//           <div className="flex items-center justify-between mb-2 gap-2">
//             <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Verifikasi Seller</h1>
//             <div className="flex items-center gap-2">
//               <button onClick={() => navigate('/')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Ke Beranda</button>
//             </div>
//           </div>

//           <div className="rounded-xl border border-neutral-200 dark:border-white/10 divide-y divide-neutral-200 dark:divide-white/10">
//             {apps.length === 0 ? (
//               <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">Belum ada pengajuan buyer untuk menjadi seller.</div>
//             ) : (
//               apps.map(a => (
//                 <div key={a.id} className="p-4 flex items-center justify-between gap-4">
//                   <div>
//                     <div className="font-semibold text-neutral-900 dark:text-neutral-100">{a.fullname || a.email}</div>
//                     <div className="text-xs text-neutral-600 dark:text-neutral-400">{a.email} • {a.storeName || '-'} • {new Date(a.createdAt).toLocaleString('id-ID')}</div>
//                   </div>
//                   <div className="flex gap-2">
//                     <button onClick={() => reject(a.id)} className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-white/10">Tolak</button>
//                     <button onClick={() => approve(a.id)} className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white">Setujui</button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { Eye, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface SellerVerification {
  _id: string;
  user_id: {
    _id: string;
    fullname: string;
    email: string;
  };
  full_name: string;
  email: string;
  phone: string;
  nama_umkm: string;
  caption?: string;
  thumbnail?: string;
  alamat: string;
  latitude: number;
  longitude: number;
  category_id: {
    _id: string;
    nama_kategori: string;
  };
  id_card_url: string;
  business_permit_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_umkm_id?: string;
  createdAt: string;
  updatedAt: string;
}

export default function VerifySellerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<SellerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch pending verifications
  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching verifications...');
      console.log('API URL:', API_URL);
      console.log('Token:', token ? 'exists' : 'missing');
      
      if (!token) {
        toast.error('Anda harus login sebagai admin', { title: 'Unauthorized' });
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/seller-verification/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache', // ⭐ Prevent caching
          'Pragma': 'no-cache'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      const result = await response.json();
      console.log('📦 Response data:', result);

      if (response.ok) {
        console.log('✅ Data loaded:', result.data?.length || 0, 'verifications');
        setVerifications(result.data || []);
      } else {
        console.error('❌ API Error:', result.message);
        toast.error(result.message || 'Gagal mengambil data verifikasi', { 
          title: 'Error' 
        });
      }
    } catch (error: any) {
      console.error('❌ Fetch error:', error);
      toast.error('Terjadi kesalahan saat mengambil data: ' + error.message, { 
        title: 'Error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Component mounted, fetching data...');
    fetchVerifications();
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log('📊 State updated:', {
      loading,
      verificationsCount: verifications.length,
      verifications
    });
  }, [loading, verifications]);

  const handleViewDetail = (id: string) => {
    navigate(`/admin/verify-seller/${id}`);
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui verifikasi ini? UMKM akan otomatis dibuat.')) {
      return;
    }

    try {
      setActionLoading(id);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/seller-verification/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          admin_notes: 'Verifikasi disetujui'
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Verifikasi berhasil disetujui! UMKM telah dibuat.', { 
          title: 'Berhasil',
          duration: 5000
        });
        
        // Remove from list
        setVerifications(prev => prev.filter(v => v._id !== id));
      } else {
        toast.error(result.message || 'Gagal menyetujui verifikasi', { 
          title: 'Error' 
        });
      }
    } catch (error: any) {
      console.error('Error approving verification:', error);
      toast.error('Terjadi kesalahan saat menyetujui verifikasi', { title: 'Error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Masukkan alasan penolakan:');
    
    if (!reason || reason.trim() === '') {
      toast.error('Alasan penolakan wajib diisi', { title: 'Validasi' });
      return;
    }

    try {
      setActionLoading(id);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/seller-verification/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          admin_notes: reason
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Verifikasi berhasil ditolak', { 
          title: 'Berhasil' 
        });
        
        // Remove from list
        setVerifications(prev => prev.filter(v => v._id !== id));
      } else {
        toast.error(result.message || 'Gagal menolak verifikasi', { 
          title: 'Error' 
        });
      }
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      toast.error('Terjadi kesalahan saat menolak verifikasi', { title: 'Error' });
    } finally {
      setActionLoading(null);
    }
  };

  // ⭐ Debug render
  console.log('🎨 Rendering VerifySellerPage');

  return (
    <div className="flex h-screen w-screen overflow-hidden md:flex-row bg-gray-100 dark:bg-neutral-900">
      <AdminSidebar
        active="verify"
        onChange={(next) => {
          if (next === 'home') navigate('/admin/dashboard');
          if (next === 'verify') navigate('/admin/verify-seller');
        }}
      />
      <div className="flex flex-1 overflow-auto">
        <div className="flex h-full w-full flex-1 flex-col gap-4 p-3 md:p-8">
          <div className="flex items-center justify-between mb-2 gap-2">
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Verifikasi Seller
              </h1>
              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Review dan setujui permintaan verifikasi seller
              </p>
            </div>
            <button 
              onClick={() => navigate('/')} 
              className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              Ke Beranda
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Pending</p>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {loading ? '...' : verifications.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Verifications List */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-white/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-neutral-400" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  Memuat data...
                </p>
              </div>
            ) : verifications.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Belum ada pengajuan verifikasi seller yang pending
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-white/10">
                {verifications.map((verification) => (
                  <div 
                    key={verification._id} 
                    className="p-4 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        {verification.thumbnail ? (
                          <img 
                            src={verification.thumbnail} 
                            alt={verification.nama_umkm}
                            className="w-16 h-16 rounded-lg object-cover border border-neutral-200 dark:border-white/10"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                            {verification.nama_umkm.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                            {verification.nama_umkm}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            <span className="font-medium">{verification.full_name}</span>
                            <span className="mx-2">•</span>
                            <span>{verification.email}</span>
                            <span className="mx-2">•</span>
                            <span>{verification.phone}</span>
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                              {verification.category_id.nama_kategori || 'tidak ada kategori'}
                            </span>
                            <span>
                              {new Date(verification.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                            📍 {verification.alamat.substring(0, 60)}...
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(verification._id)}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detail
                        </button>
                        <button
                          onClick={() => handleReject(verification._id)}
                          disabled={actionLoading === verification._id}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === verification._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Tolak
                        </button>
                        <button
                          onClick={() => handleApprove(verification._id)}
                          disabled={actionLoading === verification._id}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === verification._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                          Setujui
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
