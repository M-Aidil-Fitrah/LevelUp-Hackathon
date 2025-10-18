import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { loadApplications, saveApplications, type SellerApplication, loadUsers, saveUsers } from '@/lib/adminStorage';
import { useNavigate } from 'react-router-dom';

export default function VerifySellerPage() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<SellerApplication[]>([]);

  useEffect(() => { setApps(loadApplications().filter(a => (a.status ?? 'pending') === 'pending')); }, []);


  const approve = (id: string) => {
    // Mark application approved and upgrade user role to seller in local users store if exists
    const nextApps = apps.filter(a => a.id !== id);
    setApps(nextApps);
    const all = loadApplications().map(a => (a.id === id ? { ...a, status: 'approved' as const } : a));
    saveApplications(all);

    const users = loadUsers();
    const app = all.find(a => a.id === id);
    if (app) {
      const idx = users.findIndex(u => u.email === app.email);
      if (idx >= 0) users[idx] = { ...users[idx], role: 'seller' };
      saveUsers(users);
    }
  };

  const reject = (id: string) => {
    const nextApps = apps.filter(a => a.id !== id);
    setApps(nextApps);
    const all = loadApplications().map(a => (a.id === id ? { ...a, status: 'rejected' as const } : a));
    saveApplications(all);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden md:flex-row bg-gray-100 dark:bg-neutral-900">
      <AdminSidebar
        active="verify"
        onChange={(next) => {
          if (next === 'home') navigate('/admin/dashboard');
          if (next === 'verify') navigate('/admin/verify-seller');
        }}
      />
      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col gap-2 p-3 md:p-8">
          <div className="flex items-center justify-between mb-2 gap-2">
            <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Verifikasi Seller</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Ke Beranda</button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-white/10 divide-y divide-neutral-200 dark:divide-white/10">
            {apps.length === 0 ? (
              <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">Belum ada pengajuan buyer untuk menjadi seller.</div>
            ) : (
              apps.map(a => (
                <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">{a.fullname || a.email}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">{a.email} • {a.storeName || '-'} • {new Date(a.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => reject(a.id)} className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-white/10">Tolak</button>
                    <button onClick={() => approve(a.id)} className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white">Setujui</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
