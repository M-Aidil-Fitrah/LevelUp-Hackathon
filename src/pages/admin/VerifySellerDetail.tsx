import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, CheckCircle, XCircle, Loader2, MapPin, Phone, Mail, FileText, Image as ImageIcon, Building2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

export default function VerifySellerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verification, setVerification] = useState<SellerVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchVerificationDetail();
  }, [id]);

  const fetchVerificationDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/seller-verification/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        setVerification(result.data);
      } else {
        toast.error(result.message || 'Gagal mengambil detail verifikasi', { title: 'Error' });
        navigate('/admin/verify-seller');
      }
    } catch (error: any) {
      console.error('Error fetching verification detail:', error);
      toast.error('Terjadi kesalahan', { title: 'Error' });
      navigate('/admin/verify-seller');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Apakah Anda yakin ingin menyetujui verifikasi ini? UMKM akan otomatis dibuat.')) {
      return;
    }

    try {
      setActionLoading(true);
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
        navigate('/admin/verify-seller');
      } else {
        toast.error(result.message || 'Gagal menyetujui verifikasi', { title: 'Error' });
      }
    } catch (error: any) {
      console.error('Error approving verification:', error);
      toast.error('Terjadi kesalahan', { title: 'Error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Masukkan alasan penolakan:');
    
    if (!reason || reason.trim() === '') {
      toast.error('Alasan penolakan wajib diisi', { title: 'Validasi' });
      return;
    }

    try {
      setActionLoading(true);
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
        toast.success('Verifikasi berhasil ditolak', { title: 'Berhasil' });
        navigate('/admin/verify-seller');
      } else {
        toast.error(result.message || 'Gagal menolak verifikasi', { title: 'Error' });
      }
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      toast.error('Terjadi kesalahan', { title: 'Error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!verification) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-white/10 sticky top-0 z-10">
        <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/admin/verify-seller')}
            className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
          
          {verification.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Tolak
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Setujui
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* UMKM Info */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-white/10 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi UMKM
              </h2>
              
              <div className="space-y-4">
                {verification.thumbnail && (
                  <img 
                    src={verification.thumbnail} 
                    alt={verification.nama_umkm}
                    className="w-full h-48 object-cover rounded-lg border border-neutral-200 dark:border-white/10"
                  />
                )}
                
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400">Nama UMKM</label>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                    {verification.nama_umkm}
                  </p>
                </div>

                {verification.caption && (
                  <div>
                    <label className="text-xs text-neutral-500 dark:text-neutral-400">Deskripsi</label>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                      {verification.caption}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400">Kategori</label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      {verification.category_id.nama_kategori}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Alamat
                  </label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100 mt-1">
                    {verification.alamat}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Koordinat: {verification.latitude.toFixed(6)}, {verification.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-white/10 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Lokasi UMKM
              </h2>
              <div className="h-64 rounded-lg overflow-hidden border border-neutral-200 dark:border-white/10">
                <MapContainer
                  center={[verification.latitude, verification.longitude]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={[verification.latitude, verification.longitude]}>
                    <Popup>{verification.nama_umkm}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-white/10 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dokumen Verifikasi
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 block">KTP</label>
                  <a 
                    href={verification.id_card_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img 
                      src={verification.id_card_url} 
                      alt="KTP"
                      className="w-full h-40 object-cover rounded-lg border border-neutral-200 dark:border-white/10 hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </a>
                </div>
                
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 block">Izin Usaha</label>
                  <a 
                    href={verification.business_permit_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img 
                      src={verification.business_permit_url} 
                      alt="Izin Usaha"
                      className="w-full h-40 object-cover rounded-lg border border-neutral-200 dark:border-white/10 hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Personal Info */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-white/10 p-6">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                Status Verifikasi
              </h2>
              <div className="flex items-center gap-2">
                {verification.status === 'pending' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                    ⏳ Pending
                  </span>
                )}
                {verification.status === 'approved' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                    ✓ Disetujui
                  </span>
                )}
                {verification.status === 'rejected' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                    ✗ Ditolak
                  </span>
                )}
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-white/10 p-6">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Informasi Pribadi
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400">Nama Lengkap</label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100 mt-1 font-medium">
                    {verification.full_name}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div className="flex-1">
                    <label className="text-xs text-neutral-500 dark:text-neutral-400">Email</label>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100 mt-1">
                      {verification.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-neutral-400 mt-0.5" />
                  <div className="flex-1">
                    <label className="text-xs text-neutral-500 dark:text-neutral-400">No. Telepon</label>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100 mt-1">
                      {verification.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-white/10 p-6">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Timeline
              </h2>
              
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-neutral-500 dark:text-neutral-400">Diajukan</p>
                  <p className="text-neutral-900 dark:text-neutral-100 mt-1">
                    {new Date(verification.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>

                {verification.reviewed_at && (
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Direview</p>
                    <p className="text-neutral-900 dark:text-neutral-100 mt-1">
                      {new Date(verification.reviewed_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}

                {verification.admin_notes && (
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Catatan Admin</p>
                    <p className="text-neutral-900 dark:text-neutral-100 mt-1">
                      {verification.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}