import React, { useMemo, useState } from 'react';
import PillNav from '@/components/PillNav';
import { Footer } from '@/components/Footer';
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function OrderPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const productName = query.get('name') || '';
  const productPrice = Number(query.get('price') || '0');
  const productId = query.get('productId') || '';
  const imageUrl = query.get('imageUrl') || '/assets/images/foto1.png';
  const storeName = query.get('storeName') || '';
  const storeId = query.get('storeId') || '';

  const [qty, setQty] = useState<number>(1);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const total = productPrice * (isFinite(qty) ? qty : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to a simple confirmation with order details.
    const payload = {
      productId,
      productName,
      storeId,
      storeName,
      qty,
      customerName,
      phone,
      address,
      notes,
      total,
    };
    console.log('Order submitted', payload);
    alert('Pesanan berhasil dibuat!\n\n' + JSON.stringify(payload, null, 2));
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <PillNav
        logo={'/logoputih.svg'}
        logoAlt={'LevelUp Logo'}
        items={[
          { label: 'Home', href: '/' },
          { label: 'Marketplace', href: '/marketplace' },
          { label: 'UMKM Nearby', href: '/umkm-nearby' },
          { label: 'Chatbot AI', href: '/chatbot' },
          { label: 'Register', href: '/register', variant: 'accent' },
          { label: 'Login', href: '/login', variant: 'accent' },
        ]}
        activeHref={'/order'}
        className="custom-nav"
        ease="power2.easeOut"
        baseColor="#000000"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
        accentColor="#FF2000"
      />

      <div className="h-16 md:h-20" />

      <div className="mx-auto max-w-4xl px-4 pb-12">
        <h1 className="text-3xl font-bold tracking-tight">Pemesanan</h1>
        <p className="text-gray-500 mt-1">Lengkapi data berikut untuk memesan produk.</p>

        {/* Product summary */}
        <div className="mt-6 flex gap-4 p-4 border rounded-xl">
          <img src={imageUrl} alt={productName} className="h-20 w-20 rounded-lg object-cover" />
          <div className="flex-1">
            <div className="font-semibold">{productName}</div>
            <div className="text-sm text-gray-500">{storeName || 'Toko'}</div>
            <div className="text-sm mt-1">Harga: Rp{productPrice.toLocaleString('id-ID')}</div>
          </div>
        </div>

        {/* Order form */}
        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jumlah</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Alamat</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Catatan</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={3}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between p-4 border rounded-xl bg-gray-50">
            <div className="text-lg font-semibold">Total: Rp{total.toLocaleString('id-ID')}</div>
            <div className="flex gap-2">
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border">Kembali</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#FF2000] hover:bg-[#C92C0D] text-white">Buat Pesanan</button>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
