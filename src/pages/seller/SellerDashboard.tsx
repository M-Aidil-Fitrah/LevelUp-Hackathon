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
const getUser = (): { role?: string; email?: string; fullname?: string; name?: string; storeName?: string } | null => {
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
  const fullName = useMemo(() => user?.fullname || user?.name || (email ? email.split('@')[0] : 'Pengguna'), [user, email]);
  const storeName = useMemo(() => user?.storeName || `Toko ${fullName}` , [user, fullName]);
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

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Optional: basic size guard (e.g., 2MB)
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error('Ukuran gambar maksimal 2MB', { title: 'Gambar Terlalu Besar' });
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setForm((f) => ({ ...f, image: dataUrl }));
    };
    reader.readAsDataURL(file);
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
        <div className="flex h-full w-full flex-1 flex-col gap-2 p-3 md:p-8">
          <div className="flex items-center justify-between mb-2 gap-2">
            <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Dashboard Seller</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Ke Beranda</button>
              <button onClick={() => navigate('/marketplace')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Ke Marketplace</button>
            </div>
          </div>

          {section === 'home' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-neutral-200 dark:border-white/10 p-4">
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">Total Produk</div>
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{products.length}</div>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-white/10 p-4">
                  <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Nama Pemilik</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{fullName}</div>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-white/10 p-4">
                  <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Nama Toko</div>
                  <div className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{storeName}</div>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 dark:border-white/10 divide-y divide-neutral-200 dark:divide-white/10">
                {products.length === 0 ? (
                  <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">Belum ada produk.</div>
                ) : (
                  products.map(p => (
                    <div key={p.id} className="p-4 flex items-start gap-4">
                      <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">No Image</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.name}</div>
                        <div className="text-sm text-neutral-700 dark:text-neutral-300">Rp {p.price.toLocaleString('id-ID')}</div>
                        {p.description && <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{p.description}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate('/seller/edit')} className="px-3 py-1.5 border rounded-md text-sm border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Edit</button>
                        <button onClick={() => navigate('/seller/delete')} className="px-3 py-1.5 border rounded-md text-sm text-white bg-red-600 hover:bg-red-700">Hapus</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {(section === 'tambah' || (section === 'edit' && editingId)) && (
            <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 dark:border-white/10 p-4 md:p-5 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Nama Produk</label>
                <input
                  className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0"
                  placeholder="Contoh: Keripik Pisang Manis"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Harga (Rp)</label>
                <input
                  type="number"
                  className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0"
                  placeholder="10000"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Foto Produk</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-neutral-900 dark:text-neutral-100 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-200 hover:file:bg-neutral-300 dark:file:bg-white/10 dark:hover:file:bg-white/15"
                />
                {form.image && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={form.image} alt="Preview" className="h-16 w-16 rounded-md object-cover border border-neutral-200 dark:border-white/10" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: '' }))}
                      className="px-3 py-1.5 border rounded-md text-xs border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10"
                    >
                      Hapus Foto
                    </button>
                  </div>
                )}
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Deskripsi</label>
                <textarea
                  rows={2}
                  className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0"
                  placeholder="Deskripsi singkat produk"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="md:col-span-4 flex gap-3 justify-end">
                {(editingId || section === 'edit') && (
                  <button type="button" onClick={() => { resetForm(); setSection('edit'); }} className="px-4 py-2 border rounded-md text-sm border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Batal</button>
                )}
                <button type="submit" className="px-4 py-2 rounded-md text-white bg-[#FF2000] hover:brightness-95 text-sm">
                  {editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          )}

          {(section === 'edit' || section === 'hapus') && (
            <div className="rounded-xl border border-neutral-200 dark:border-white/10 divide-y divide-neutral-200 dark:divide-white/10">
              {products.length === 0 ? (
                <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">Belum ada produk.</div>
              ) : (
                products.map(p => (
                  <div key={p.id} className="p-4 flex items-start gap-4">
                    <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">No Image</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{p.name}</div>
                      <div className="text-sm text-neutral-700 dark:text-neutral-300">Rp {p.price.toLocaleString('id-ID')}</div>
                      {p.description && <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{p.description}</div>}
                    </div>
                    <div className="flex gap-2">
                      {section === 'edit' && (
                        <button onClick={() => { handleEdit(p.id); setSection('edit'); }} className="px-3 py-1.5 border rounded-md text-sm border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Edit</button>
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
            <div className="rounded-xl border border-neutral-200 dark:border-white/10">
              {products.length === 0 ? (
                <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">Belum ada produk. Gunakan formulir di atas untuk menambah produk.</div>
              ) : (
                <div className="p-4 text-sm text-neutral-700 dark:text-neutral-300">Gunakan menu Edit/Hapus untuk mengelola produk.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
