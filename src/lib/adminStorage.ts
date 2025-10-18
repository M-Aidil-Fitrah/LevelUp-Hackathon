export type AdminUser = {
  id?: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  fullname?: string;
  name?: string;
  verified?: boolean;
};

const USERS_KEY = 'users';

export const loadUsers = (): AdminUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as AdminUser[]) : fallbackFromCurrent();
  } catch {
    return fallbackFromCurrent();
  }
};

const fallbackFromCurrent = (): AdminUser[] => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return [];
    const u = JSON.parse(raw);
    return [
      {
        id: u.id || u.email,
        email: u.email,
        role: (u.role as AdminUser['role']) || 'buyer',
        fullname: u.fullname || u.name,
        name: u.name,
        verified: u.verified ?? true,
      },
    ];
  } catch {
    return [];
  }
};

export const saveUsers = (users: AdminUser[]) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
};

export const countByRole = (users: AdminUser[]) => {
  const total = users.length;
  const seller = users.filter((u) => u.role === 'seller').length;
  const admin = users.filter((u) => u.role === 'admin').length;
  return { total, seller, admin };
};

// Applications to become seller (pending requests)
export type SellerApplication = {
  id: string;
  email: string;
  fullname?: string;
  storeName?: string;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
};

const APPLICATIONS_KEY = 'seller:applications';

export const loadApplications = (): SellerApplication[] => {
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    return raw ? (JSON.parse(raw) as SellerApplication[]) : [];
  } catch {
    return [];
  }
};

export const saveApplications = (apps: SellerApplication[]) => {
  try { localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps)); } catch {}
};

