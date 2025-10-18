import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { getUser, loadProducts, saveProducts, type Product } from '@/lib/sellerStorage';

export default function EditProductPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);
  const email = user?.email;

  const [items, setItems] = useState<Product[]>(() => loadProducts(email));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; price: string; image?: string; description?: string }>({ name: '', price: '', image: '', description: '' });

  const selectItem = (id: string) => {
    const p = items.find(x => x.id === id);
    if (!p) return;
    setEditingId(id);
    setForm({ name: p.name, price: String(p.price), image: p.image || '', description: p.description || '' });
  };

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error('Ukuran gambar maksimal 2MB', { title: 'Gambar Terlalu Besar' });
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result || '') }));
    reader.readAsDataURL(file);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const price = Number(form.price);
    if (!form.name || !price || price < 0) {
      toast.error('Nama dan harga harus diisi dengan benar.', { title: 'Validasi' });
      return;
    }
    const next = items.map(p => (p.id === editingId ? { ...p, name: form.name, price, image: form.image, description: form.description } : p));
    setItems(next);
    saveProducts(email, next);
    toast.success('Produk diperbarui', { title: 'Berhasil' });
    setEditingId(null);
    setForm({ name: '', price: '', image: '', description: '' });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Edit Produk</h2>
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
              <button onClick={() => selectItem(p.id)} className="px-3 py-1.5 border rounded-md text-sm border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Edit</button>
            </div>
          ))
        )}
      </div>

      {editingId && (
        <form onSubmit={save} className="rounded-xl border border-neutral-200 dark:border-white/10 p-4 md:p-5 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Nama Produk</label>
            <input className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Harga (Rp)</label>
            <input type="number" className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Foto Produk</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-neutral-900 dark:text-neutral-100 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-200 hover:file:bg-neutral-300 dark:file:bg-white/10 dark:hover:file:bg-white/15"/>
            {form.image && <img src={form.image} className="mt-2 h-16 w-16 rounded-md object-cover border border-neutral-200 dark:border-white/10"/>}
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Deskripsi</label>
            <textarea rows={2} className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
          </div>
          <div className="md:col-span-4 flex gap-3 justify-end">
            <button type="button" onClick={()=>{setEditingId(null); setForm({name:'',price:'',image:'',description:''});}} className="px-4 py-2 border rounded-md text-sm border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Batal</button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-[#FF2000] hover:brightness-95 text-sm">Simpan</button>
          </div>
        </form>
      )}

      <div className="flex justify-end">
        <button onClick={()=>navigate('/seller/dashboard')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Kembali</button>
      </div>
    </div>
  );
}
