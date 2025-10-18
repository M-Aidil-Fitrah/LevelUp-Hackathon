import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { getUser, loadProducts, saveProducts, type Product } from '@/lib/sellerStorage';

export default function AddProductPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);
  const email = user?.email;

  const [form, setForm] = useState<{ name: string; price: string; image?: string; description?: string }>({
    name: '',
    price: '',
    image: '',
    description: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name || !price || price < 0) {
      toast.error('Nama dan harga harus diisi dengan benar.', { title: 'Validasi' });
      return;
    }
    const items = loadProducts(email);
    const newItem: Product = { id: crypto.randomUUID(), name: form.name, price, image: form.image, description: form.description };
    saveProducts(email, [newItem, ...items]);
    toast.success('Produk berhasil ditambahkan', { title: 'Berhasil' });
    navigate('/seller/dashboard');
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Tambah Produk</h2>
      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 dark:border-white/10 p-4 md:p-5 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Nama Produk</label>
          <input className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Harga (Rp)</label>
          <input type="number" className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Foto Produk</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-neutral-900 dark:text-neutral-100 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-200 hover:file:bg-neutral-300 dark:file:bg-white/10 dark:hover:file:bg-white/15"/>
          {form.image && <img src={form.image} className="mt-2 h-16 w-16 rounded-md object-cover border border-neutral-200 dark:border-white/10"/>}
        </div>
        <div className="md:col-span-4">
          <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Deskripsi</label>
          <textarea rows={2} className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
        </div>
        <div className="md:col-span-4 flex gap-3 justify-end">
          <button type="button" onClick={()=>navigate('/seller/dashboard')} className="px-4 py-2 border rounded-md text-sm border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Batal</button>
          <button type="submit" className="px-4 py-2 rounded-md text-white bg-[#FF2000] hover:brightness-95 text-sm">Simpan</button>
        </div>
      </form>
    </div>
  );
}
