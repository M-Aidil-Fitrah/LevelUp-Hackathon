import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const navigate = useNavigate()
    const [formData, setFormData] = useState({
      fullname: "",
      email: "",
      password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const rawApiUrl = import.meta.env.VITE_API_URL ?? '';
    const API_URL = rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`;
  

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    setError(null);

    try {
      console.log("POST to:", `${API_URL}/user/register`);
      console.log("body:", formData);
      const response = await fetch(`${API_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok && result.token){
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user))
        navigate("/", { replace: true });
        window.location.reload();
      }
    } catch (err) {
      setError("Registration error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid md:grid-cols-2">
      <LeftPanel heading="Create new account" sub="Start for free" />
      <div className="flex items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-md space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Create new account</h1>
            <p className="text-slate-600">
              Already a member?{' '}
              <Link className="text-[#FF2000] font-medium hover:underline" to="/login">Log in</Link>
            </p>
          </header>
          <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="full">Full name</label>
                <input id="full" type="text" placeholder="Full name" value={formData.fullname} onChange={handleInputChange} name="fullname" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FF2000]/60" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} name="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FF2000]/60" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} name="password" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#FF2000]/60" />
            </div>
            <div className="flex gap-3">
              <button type="button" className="flex-1 rounded-xl border border-slate-200 bg-white text-[#0F172A] py-3 font-semibold hover:bg-slate-50 transition">Change method</button>
              <button type="submit" className="flex-1 rounded-xl bg-[#FF2000] text-white py-3 font-semibold shadow-sm hover:brightness-95 transition">Create account</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function LeftPanel({ heading, sub }: { heading: string; sub: string }) {
  return (
    <div className="hidden md:flex relative items-center bg-[#FF2000] text-white">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_35%),radial-gradient(circle_at_80%_60%,white_0%,transparent_30%)]" />

      {/* Logo pinned near the top-left */}
      <img
        src="/logoputih.svg"
        alt="Logo"
        className="absolute z-10 top-8 left-8 md:top-10 md:left-10 lg:top-12 lg:left-12 h-70 w-auto"
      />

      {/* Centered text content */}
      <div className="absolute inset-0 flex items-center">
        <div className="relative z-10 px-10 md:px-16 lg:px-24 space-y-6">
          <p className="uppercase tracking-[0.25em] text-white/80 text-xs">Start for free</p>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            {heading}<span className="text-white">.</span>
          </h2>
          <p className="text-white/90">{sub}</p>
        </div>
      </div>
    </div>
  )
}
