import React, { useState, useEffect } from 'react';
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

export default function EditProductPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ 
    nama_product: string; 
    harga: string; 
    image: File | null;
    imagePreview?: string;
    deskripsi_produk?: string;
  }>({ nama_product: '', harga: '', image: null, imagePreview: '', deskripsi_produk: '' });

  // AI assist for description
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  const selectItem = (id: string) => {
    const p = items.find(x => x._id === id);
    if (!p) return;
    setEditingId(id);
    setForm({ 
      nama_product: p.nama_product, 
      harga: String(p.harga), 
      image: null,
      imagePreview: p.thumbnail || '', 
      deskripsi_produk: p.deskripsi_produk || '' 
    });
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
    setAiPrompt('');
    setAiError(null);
  };

  const handleGenerateDescription = async () => {
    if (!aiPrompt.trim() && !form.name.trim()) {
      toast.error('Isi nama produk atau prompt terlebih dahulu.', { title: 'Butuh konteks' });
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const AI_URL = (import.meta as any).env?.VITE_AI_API_URL || '';
      const API_URL = (import.meta as any).env?.VITE_API_URL || '';
      let generated = '';
      const target = AI_URL || (API_URL ? `${API_URL.replace(/\/$/, '')}/ai/generate` : '');
      if (target) {
        try {
          const res = await fetch(target, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: aiPrompt || `Tulis deskripsi singkat dan menarik untuk produk bernama "${form.name}".`,
              max_tokens: 180,
              temperature: 0.8,
            }),
          });
          const data = await res.json().catch(() => ({}));
          generated = data?.text || data?.description || '';
        } catch {}
      }
      if (!generated) {
        const name = form.name.trim();
        const p = aiPrompt.trim();
        generated = [
          name ? `${name} adalah produk berkualitas yang dibuat dengan perhatian pada detail.` : '',
          p ? `Dirancang khusus untuk: ${p}.` : '',
          'Cocok untuk digunakan sehari-hari, praktis, dan bernilai harga. Pesan sekarang dan rasakan bedanya!'
        ].filter(Boolean).join(' ');
      }
      if (!generated) throw new Error('Gagal membuat deskripsi.');
      setForm((f) => ({ ...f, description: generated }));
      toast.success('Deskripsi berhasil dibuat dengan AI', { title: 'Selesai' });
    } catch (err: any) {
      const msg = err?.message || 'Gagal membuat deskripsi.';
      setAiError(msg);
      toast.error(msg, { title: 'Kesalahan' });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Edit Produk</h2>
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
          {/* Optional AI prompt input */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Bantu tulis deskripsi (opsional)</label>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                className="flex-1 border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0"
                placeholder="Tulis konteks deskripsi, misal: keripik pedas tingkat 3, cocok untuk oleh-oleh, tahan 3 bulan"
                value={aiPrompt}
                onChange={(e)=>setAiPrompt(e.target.value)}
              />
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiLoading}
                className="px-4 py-2 rounded-md text-white bg-[#FF2000] hover:brightness-95 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {aiLoading ? 'Membuat…' : 'Buat Deskripsi dengan AI'}
              </button>
            </div>
            {aiError && <p className="mt-1 text-xs text-red-500">{aiError}</p>}
            {!aiError && aiPrompt && !aiLoading && (
              <p className="mt-1 text-[11px] text-neutral-500">Hasil AI akan otomatis mengisi kolom deskripsi di bawah.</p>
            )}
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
