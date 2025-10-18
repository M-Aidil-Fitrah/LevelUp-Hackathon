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

  const handleDelete = (id: string) => {
    const target = items.find(p => p.id === id);
    const ok = window.confirm(`Apakah Anda yakin ingin menghapus produk "${target?.name ?? ''}"?`);
    if (!ok) return;
    const next = items.filter(p => p.id !== id);
    setItems(next);
    saveProducts(email, next);
    toast.success('Produk dihapus', { title: 'Hapus' });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Hapus Produk</h2>
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
              <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 border rounded-md text-sm text-white bg-red-600 hover:bg-red-700">Hapus</button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <button onClick={()=>navigate('/seller/dashboard')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Kembali</button>
      </div>
    </div>
  );
}
