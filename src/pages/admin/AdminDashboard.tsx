import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface VerificationRequest {
    _id: string;
    user_id: {
        fullname: string;
        email: string;
    };
    fullname: string;
    email: string;
    phone: string;
    address: string;
    business_name: string;
    business_type: string;
    business_description: string;
    id_card_url: string;
    business_permit_url: string | null;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    reviewed_by?: {
        fullname: string;
        email: string;
    };
    reviewed_at?: string;
    rejection_reason?: string;
}

export default function AdminDashboard() {
    const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = 'https://levelup-backend-production-839e.up.railway.app/api';
    const token = localStorage.getItem('adminToken');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchVerifications();
    }, [filter]);

    const fetchVerifications = async () => {
        try {
            setLoading(true);
            const statusParam = filter === 'all' ? '' : `?status=${filter}`;
            const response = await fetch(`${API_URL}/seller-verification/pending${statusParam}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok) {
                setVerifications(result.data);
            } else {
                console.error('Error fetching verifications:', result.message);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    const handleViewDetail = (verification: VerificationRequest) => {
        setSelectedVerification(verification);
        setShowModal(true);
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menyetujui permintaan ini?')) return;

        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/seller-verification/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (response.ok) {
                alert('Permintaan berhasil disetujui!');
                setShowModal(false);
                fetchVerifications();
            } else {
                alert(result.message || 'Gagal menyetujui permintaan');
            }
        } catch (error) {
            console.error('Error approving:', error);
            alert('Terjadi kesalahan');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) {
            alert('Alasan penolakan wajib diisi');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`${API_URL}/seller-verification/${id}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rejection_reason: rejectionReason }),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Permintaan berhasil ditolak');
                setShowModal(false);
                setRejectionReason('');
                fetchVerifications();
            } else {
                alert(result.message || 'Gagal menolak permintaan');
            }
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Terjadi kesalahan');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
            approved: 'bg-green-500/20 text-green-500 border-green-500',
            rejected: 'bg-red-500/20 text-red-500 border-red-500',
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-sm text-gray-600">Kelola Verifikasi Seller</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{adminUser.fullname}</p>
                                <p className="text-xs text-gray-500">{adminUser.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                        <div className="flex gap-2">
                            {['pending', 'approved', 'rejected', 'all'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        filter === status
                                            ? 'bg-[#FF2000] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {status === 'pending' && 'Pending'}
                                    {status === 'approved' && 'Disetujui'}
                                    {status === 'rejected' && 'Ditolak'}
                                    {status === 'all' && 'Semua'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-yellow-500">
                                    {verifications.filter(v => v.status === 'pending').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">⏳</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Disetujui</p>
                                <p className="text-3xl font-bold text-green-500">
                                    {verifications.filter(v => v.status === 'approved').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✓</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ditolak</p>
                                <p className="text-3xl font-bold text-red-500">
                                    {verifications.filter(v => v.status === 'rejected').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✗</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verification List */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF2000] mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                ) : verifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <p className="text-gray-500">Tidak ada data</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Pemohon
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Nama Usaha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Jenis Usaha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {verifications.map((verification) => (
                                    <tr key={verification._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {verification.fullname}
                                                </p>
                                                <p className="text-sm text-gray-500">{verification.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-900">{verification.business_name}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-900">{verification.business_type}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(verification.status)}`}>
                                                {verification.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(verification.createdAt).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewDetail(verification)}
                                                className="text-[#FF2000] hover:underline"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showModal && selectedVerification && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Detail Verifikasi</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(selectedVerification.status)}`}>
                                    Status: {selectedVerification.status}
                                </span>
                            </div>

                            {/* Personal Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Lengkap
                                    </label>
                                    <p className="text-gray-900">{selectedVerification.fullname}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <p className="text-gray-900">{selectedVerification.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        No. Telepon
                                    </label>
                                    <p className="text-gray-900">{selectedVerification.phone}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Alamat
                                    </label>
                                    <p className="text-gray-900">{selectedVerification.address}</p>
                                </div>
                            </div>

                            {/* Business Info */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Informasi Usaha</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Usaha
                                        </label>
                                        <p className="text-gray-900">{selectedVerification.business_name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Jenis Usaha
                                        </label>
                                        <p className="text-gray-900">{selectedVerification.business_type}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi Usaha
                                        </label>
                                        <p className="text-gray-900">{selectedVerification.business_description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">Dokumen</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Foto KTP
                                        </label>
                                        <a
                                            href={selectedVerification.id_card_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block"
                                        >
                                            <img
                                                src={selectedVerification.id_card_url}
                                                alt="KTP"
                                                className="w-full h-48 object-cover rounded-lg border"
                                            />
                                        </a>
                                    </div>
                                    {selectedVerification.business_permit_url && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Izin Usaha
                                            </label>
                                            <a
                                                href={selectedVerification.business_permit_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <img
                                                    src={selectedVerification.business_permit_url}
                                                    alt="Izin Usaha"
                                                    className="w-full h-48 object-cover rounded-lg border"
                                                />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Rejection Reason (if rejected) */}
                            {selectedVerification.status === 'rejected' && selectedVerification.rejection_reason && (
                                <div className="border-t pt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Alasan Penolakan
                                    </label>
                                    <p className="text-red-600">{selectedVerification.rejection_reason}</p>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedVerification.status === 'pending' && (
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Aksi</h3>
                                    
                                    {/* Rejection Reason Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Alasan Penolakan (opsional untuk approve, wajib untuk reject)
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF2000] focus:border-transparent"
                                            placeholder="Masukkan alasan jika menolak..."
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleApprove(selectedVerification._id)}
                                            disabled={actionLoading}
                                            className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Processing...' : 'Setujui'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedVerification._id)}
                                            disabled={actionLoading}
                                            className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Processing...' : 'Tolak'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}