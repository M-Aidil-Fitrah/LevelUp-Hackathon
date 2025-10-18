import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { getUser, loadProducts, saveProducts, type Product } from '@/lib/sellerStorage';

export default function DeleteProductPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);
  const email = user?.email;
  const [items, setItems] = useState<Product[]>(() => loadProducts(email));
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const target = items.find(p => p.id === confirmId);

  const openConfirm = (id: string) => setConfirmId(id);
  const closeConfirm = () => setConfirmId(null);
  const confirmDelete = () => {
    if (!confirmId) return;
    const next = items.filter(p => p.id !== confirmId);
    setItems(next);
    saveProducts(email, next);
    toast.success('Produk dihapus', { title: 'Hapus' });
    setConfirmId(null);
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
        {items.length === 0 ? (
          <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">Belum ada produk.</div>
        ) : (
          items.map(p => (
            <div key={p.id} className="p-4 flex items-start gap-4">
              <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover"/> : <span className="text-xs text-neutral-500 dark:text-neutral-400">No Image</span>}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.name}</div>
                <div className="text-sm text-neutral-700 dark:text-neutral-300">Rp {p.price.toLocaleString('id-ID')}</div>
                {p.description && <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{p.description}</div>}
              </div>
              <button onClick={() => openConfirm(p.id)} className="px-3 py-1.5 border rounded-md text-sm text-white bg-red-600 hover:bg-red-700">Hapus</button>
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
            <p className="text-sm text-neutral-300">Apakah Anda yakin ingin menghapus produk "{target?.name}"? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeConfirm} className="px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/10 text-sm">Batal</button>
              <button onClick={confirmDelete} className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
