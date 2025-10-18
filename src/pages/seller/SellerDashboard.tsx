import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import SellerSidebar, { type SellerSection } from '@/components/seller/SellerSidebar';

// Product type
type Product = {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
};

// Helpers for localStorage per-user
const getUser = (): { role?: string; email?: string } | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const keyFor = (email?: string) => (email ? `seller:products:${email}` : 'seller:products');

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const user = useMemo(() => getUser(), []);
  const email = user?.email;
  const [products, setProducts] = useState<Product[]>([]);
  const [section, setSection] = useState<SellerSection>('home');

  const [form, setForm] = useState<{ id?: string; name: string; price: string; image?: string; description?: string }>({
    name: '',
    price: '',
    image: '',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Guard: only seller can access
  useEffect(() => {
    if (!user || user.role !== 'seller') {
      toast.error('Akses ditolak. Hanya seller yang dapat membuka dashboard ini.', { title: 'Tidak diizinkan' });
      navigate('/');
      return;
    }
  }, [navigate, toast, user]);

  // Load products
  useEffect(() => {
    try {
      const raw = localStorage.getItem(keyFor(email));
      if (raw) setProducts(JSON.parse(raw));
    } catch {}
  }, [email]);

  const persist = (next: Product[]) => {
    setProducts(next);
    try {
      localStorage.setItem(keyFor(email), JSON.stringify(next));
    } catch {}
  };

  const resetForm = () => {
    setForm({ name: '', price: '', image: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name || !price || price < 0) {
      toast.error('Nama dan harga harus diisi dengan benar.', { title: 'Validasi' });
      return;
    }

    if (editingId) {
      const next = products.map(p => (p.id === editingId ? { ...p, name: form.name, price, image: form.image, description: form.description } : p));
      persist(next);
      toast.success('Produk berhasil diperbarui', { title: 'Berhasil' });
      resetForm();
    } else {
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: form.name,
        price,
        image: form.image,
        description: form.description
      };
      persist([newProduct, ...products]);
      toast.success('Produk berhasil ditambahkan', { title: 'Berhasil' });
      resetForm();
    }
  };

  const handleEdit = (id: string) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    setForm({ id: p.id, name: p.name, price: String(p.price), image: p.image || '', description: p.description || '' });
    setEditingId(id);
  };

  const handleDelete = (id: string) => {
    const next = products.filter(p => p.id !== id);
    persist(next);
    toast.success('Produk dihapus', { title: 'Hapus' });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden md:flex-row bg-gray-100 dark:bg-neutral-900">
      <SellerSidebar active={section} onChange={setSection} />
      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col gap-2 bg-white p-3 md:p-8 dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg md:text-xl font-semibold">Dashboard Seller</h1>
            <button onClick={() => navigate('/marketplace')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border hover:bg-gray-100">Ke Marketplace</button>
          </div>

          {section === 'home' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500">Total Produk</div>
                <div className="text-2xl font-bold">{products.length}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500">Aksi Cepat</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setSection('tambah')} className="px-3 py-1.5 text-sm rounded-md border">Tambah Produk</button>
                  <button onClick={() => setSection('edit')} className="px-3 py-1.5 text-sm rounded-md border">Edit Produk</button>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-gray-500">Tips</div>
                <div className="text-sm mt-1 text-gray-600">Kelola produk Anda melalui menu di sisi kiri.</div>
              </div>
            </div>
          )}

          {(section === 'tambah' || (section === 'edit' && editingId)) && (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-4 md:p-5 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Nama Produk</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Contoh: Keripik Pisang Manis"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="10000"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL Gambar (opsional)</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="https://..."
                  value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="Deskripsi singkat produk"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="md:col-span-4 flex gap-3 justify-end">
                {(editingId || section === 'edit') && (
                  <button type="button" onClick={() => { resetForm(); setSection('edit'); }} className="px-4 py-2 border rounded-md text-sm">Batal</button>
                )}
                <button type="submit" className="px-4 py-2 rounded-md text-white bg-[#FF2000] hover:brightness-95 text-sm">
                  {editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          )}

          {(section === 'edit' || section === 'hapus') && (
            <div className="bg-white rounded-xl border divide-y">
              {products.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">Belum ada produk.</div>
              ) : (
                products.map(p => (
                  <div key={p.id} className="p-4 flex items-start gap-4">
                    <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-gray-600">Rp {p.price.toLocaleString('id-ID')}</div>
                      {p.description && <div className="text-xs text-gray-500 mt-1">{p.description}</div>}
                    </div>
                    <div className="flex gap-2">
                      {section === 'edit' && (
                        <button onClick={() => { handleEdit(p.id); setSection('edit'); }} className="px-3 py-1.5 border rounded-md text-sm">Edit</button>
                      )}
                      {section === 'hapus' && (
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 border rounded-md text-sm text-white bg-red-500">Hapus</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {section === 'tambah' && (
            <div className="bg-white rounded-xl border">
              {products.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">Belum ada produk. Gunakan formulir di atas untuk menambah produk.</div>
              ) : (
                <div className="p-4 text-sm text-gray-600">Gunakan menu Edit/Hapus untuk mengelola produk.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
