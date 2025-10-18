import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';

const API_URL = 'https://levelup-backend-production-839e.up.railway.app/api';

interface Umkm {
  _id: string;
  nama_umkm: string;
}

export default function AddProductPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [umkms, setUmkms] = useState<Umkm[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    umkm_id: '',
    nama_product: '',
    harga: '',
    deskripsi_product: '',
    image: null as File | null
  });

  // AI assist states
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Fetch UMKMs on mount
  useEffect(() => {
    const fetchUmkms = async () => {
      try {
        const response = await fetch(`${API_URL}/umkm/my-umkms`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.status === 200) {
          setUmkms(data.data);
          if (data.data.length > 0) {
            setForm(f => ({ ...f, umkm_id: data.data[0]._id }));
          }
        }
      } catch (error) {
        console.error('Error fetching UMKMs:', error);
        toast.error('Gagal memuat data UMKM', { title: 'Error' });
      }
    };
    fetchUmkms();
  }, [token]);

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error('Ukuran gambar maksimal 2MB', { title: 'Gambar Terlalu Besar' });
      e.target.value = '';
      return;
    }
    setForm(f => ({ ...f, image: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.umkm_id || !form.nama_product || !form.harga) {
      toast.error('Semua field wajib diisi', { title: 'Validasi' });
      return;
    }

    const price = Number(form.harga);
    if (isNaN(price) || price <= 0) {
      toast.error('Harga harus berupa angka positif', { title: 'Validasi' });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('umkm_id', form.umkm_id);
      formData.append('nama_product', form.nama_product);
      formData.append('harga', form.harga);
      formData.append('deskripsi_product', form.deskripsi_product);
      if (form.image) {
        formData.append('thumbnail', form.image);
      }

      const response = await fetch(`${API_URL}/product/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.status === 201) {
        toast.success('Produk berhasil ditambahkan', { title: 'Berhasil' });
        navigate('/seller/dashboard');
      } else {
        toast.error(data.message || 'Gagal menambahkan produk', { title: 'Error' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Terjadi kesalahan saat menambahkan produk', { title: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  // Try to generate description with AI; fallback to client-side template
  const handleGenerateDescription = async () => {
    if (!aiPrompt.trim() && !form.nama_product.trim()) {
      toast.error('Isi nama produk atau prompt terlebih dahulu.', { title: 'Butuh konteks' });
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      // Use chatbot endpoint to generate description
      const response = await fetch(`${API_URL}/chatbot/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: aiPrompt || `Buatkan deskripsi produk yang menarik dan persuasif untuk produk bernama "${form.nama_product}". Fokus pada manfaat dan keunggulan produk. Maksimal 3 paragraf.`
        })
      });

      const data = await response.json();

      if (data.status === 200) {
        const generated = data.data?.bot_response || '';
        setForm((f) => ({ ...f, deskripsi_product: generated }));
        toast.success('Deskripsi berhasil dibuat dengan AI', { title: 'Selesai' });
      } else {
        throw new Error(data.message || 'Gagal generate deskripsi');
      }
    } catch (err) {
      const error = err as Error;
      const msg = error?.message || 'Gagal membuat deskripsi.';
      setAiError(msg);
      
      // Fallback: simple client-side templated description
      const name = form.nama_product.trim();
      const p = aiPrompt.trim();
      const generated = [
        name ? `${name} adalah produk berkualitas yang dibuat dengan perhatian pada detail.` : '',
        p ? `Dirancang khusus untuk: ${p}.` : '',
        'Cocok untuk digunakan sehari-hari, praktis, dan bernilai harga. Pesan sekarang dan rasakan bedanya!'
      ].filter(Boolean).join(' ');
      
      setForm((f) => ({ ...f, deskripsi_product: generated }));
      toast.error('Menggunakan template default', { title: 'AI Error' });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Tambah Produk</h2>
        <div className="flex gap-2">
          <button onClick={()=>navigate('/')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Ke Beranda</button>
          <button onClick={()=>navigate('/seller/dashboard')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Ke Dashboard</button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 dark:border-white/10 p-4 md:p-5 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
        <div className="md:col-span-4">
          <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">UMKM *</label>
          <select 
            className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-0"
            value={form.umkm_id}
            onChange={e=>setForm(f=>({...f,umkm_id:e.target.value}))}
            required
          >
            <option value="">Pilih UMKM</option>
            {umkms.map(umkm => (
              <option key={umkm._id} value={umkm._id}>{umkm.nama_umkm}</option>
            ))}
          </select>
          {umkms.length === 0 && (
            <p className="mt-1 text-xs text-red-500">Anda belum memiliki UMKM. Silakan buat UMKM terlebih dahulu.</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Nama Produk *</label>
          <input 
            required
            className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0" 
            value={form.nama_product} 
            onChange={e=>setForm(f=>({...f,nama_product:e.target.value}))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Harga (Rp) *</label>
          <input 
            type="number" 
            required
            min="0"
            step="1000"
            className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0" 
            value={form.harga} 
            onChange={e=>setForm(f=>({...f,harga:e.target.value}))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200">Foto Produk</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-neutral-900 dark:text-neutral-100 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-neutral-200 hover:file:bg-neutral-300 dark:file:bg-white/10 dark:hover:file:bg-white/15"/>
          {form.image && (
            <div className="mt-2">
              <img src={URL.createObjectURL(form.image)} className="h-16 w-16 rounded-md object-cover border border-neutral-200 dark:border-white/10"/>
            </div>
          )}
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
          <textarea 
            rows={4} 
            className="w-full border border-neutral-300 dark:border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-0" 
            value={form.deskripsi_product} 
            onChange={e=>setForm(f=>({...f,deskripsi_product:e.target.value}))}
            placeholder="Tulis deskripsi produk..."
          />
        </div>
        <div className="md:col-span-4 flex gap-3 justify-end">
          <button type="button" onClick={()=>navigate('/seller/dashboard')} className="px-4 py-2 border rounded-md text-sm border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Batal</button>
          <button 
            type="submit" 
            disabled={loading || umkms.length === 0}
            className="px-4 py-2 rounded-md text-white bg-[#FF2000] hover:brightness-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
}
