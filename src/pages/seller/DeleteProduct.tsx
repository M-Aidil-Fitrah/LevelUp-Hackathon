import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://levelup-backend-production-839e.up.railway.app/api';

interface Product {
  _id: string;
  umkm_id: string;
  nama_product: string;
  harga: number;
  thumbnail?: string;
  deskripsi_produk?: string;
}

export default function DeleteProductPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const target = items.find(p => p._id === confirmId);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/product/my-products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.status === 200) {
        setItems(data.data);
      } else {
        toast.error(data.message || 'Gagal memuat produk', { title: 'Error' });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal memuat produk', { title: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  const openConfirm = (id: string) => setConfirmId(id);
  const closeConfirm = () => setConfirmId(null);
  
  const confirmDelete = async () => {
    if (!confirmId) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/product/delete/${confirmId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 200) {
        toast.success('Produk berhasil dihapus', { title: 'Berhasil' });
        setConfirmId(null);
        fetchProducts(); // Refresh list
      } else {
        toast.error(data.message || 'Gagal menghapus produk', { title: 'Error' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Terjadi kesalahan saat menghapus produk', { title: 'Error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Hapus Produk</h2>
        <div className="flex gap-2">
          <button onClick={()=>navigate('/')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Ke Beranda</button>
          <button onClick={()=>navigate('/seller/dashboard')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Ke Dashboard</button>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 divide-y divide-neutral-200 dark:divide-white/10">
        {loading ? (
          <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">Memuat produk...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">Belum ada produk.</div>
        ) : (
          items.map(p => (
            <div key={p._id} className="p-4 flex items-start gap-4">
              <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                {p.thumbnail ? <img src={p.thumbnail} alt={p.nama_product} className="h-full w-full object-cover"/> : <span className="text-xs text-neutral-500 dark:text-neutral-400">No Image</span>}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.nama_product}</div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300">Rp {p.harga.toLocaleString('id-ID')}</div>
                {p.deskripsi_produk && <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{p.deskripsi_produk}</div>}
              </div>
              <button 
                onClick={() => openConfirm(p._id)} 
                className="px-3 py-1.5 border rounded-md text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                disabled={deleting}
              >
                Hapus
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={()=>navigate('/seller/dashboard')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Kembali</button>
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-neutral-900 text-neutral-100 p-5 shadow-xl">
            <h3 className="text-base font-semibold mb-1">Konfirmasi Hapus</h3>
            <p className="text-sm text-neutral-300">Apakah Anda yakin ingin menghapus produk "{target?.nama_product}"? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={closeConfirm} 
                disabled={deleting}
                className="px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/10 text-sm disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={deleting}
                className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
