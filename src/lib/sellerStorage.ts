export type Product = {
  id: string;
  name: string;
  price: number;
  image?: string; // data URL or remote URL
  description?: string;
};

export const getUser = (): { role?: string; email?: string } | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const keyFor = (email?: string) => (email ? `seller:products:${email}` : 'seller:products');

export const loadProducts = (email?: string): Product[] => {
  try {
    const raw = localStorage.getItem(keyFor(email));
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
};

export const saveProducts = (email: string | undefined, items: Product[]) => {
  try {
    localStorage.setItem(keyFor(email), JSON.stringify(items));
  } catch {}
};
