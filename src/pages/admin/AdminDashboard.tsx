import { useEffect, useMemo, useState } from 'react';
import AdminSidebar, { type AdminSection } from '@/components/admin/AdminSidebar';
import { countByRole, loadUsers, type AdminUser } from '@/lib/adminStorage';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState<AdminSection>('home');
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => { setUsers(loadUsers()); }, []);
  const counts = useMemo(() => countByRole(users), [users]);

  return (
    <div className="flex h-screen w-screen overflow-hidden md:flex-row bg-gray-100 dark:bg-neutral-900">
      <AdminSidebar active={section} onChange={setSection} />
      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col gap-2 p-3 md:p-8">
          <div className="flex items-center justify-between mb-2 gap-2">
            <h1 className="text-lg md:text-xl font-semibold text-neutral-900 dark:text-neutral-100">Admin Dashboard</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} className="text-xs md:text-sm px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-neutral-100 hover:bg-gray-200 dark:hover:bg-white/10">Ke Beranda</button>
            </div>
          </div>

          {section === 'home' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-neutral-200 dark:border-white/10 p-4">
                <div className="text-sm text-neutral-600 dark:text-neutral-300">Total User</div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{counts.total}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-white/10 p-4">
                <div className="text-sm text-neutral-600 dark:text-neutral-300">Total Seller</div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{counts.seller}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-white/10 p-4">
                <div className="text-sm text-neutral-600 dark:text-neutral-300">Total Admin</div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{counts.admin}</div>
              </div>
            </div>
          )}

          {section === 'verify' && (
            <div className="rounded-xl border border-neutral-200 dark:border-white/10 divide-y divide-neutral-200 dark:divide-white/10">
              {users.length === 0 ? (
                <div className="p-6 text-sm text-neutral-600 dark:text-neutral-300">Belum ada user.</div>
              ) : (
                users.map(u => (
                  <div key={u.id || u.email} className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">{u.fullname || u.name || u.email}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">{u.email} • {u.role}</div>
                    </div>
                    {u.role === 'seller' ? (
                      <span className="text-xs px-2 py-1 rounded-full border border-white/20 text-neutral-100">Terverifikasi</span>
                    ) : (
                      <button disabled className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 dark:border-white/20 text-neutral-500">Bukan seller</button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
