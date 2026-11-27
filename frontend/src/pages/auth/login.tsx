import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '@/components/layouts';
import { resolveRole, homePath, type Role } from '@/lib/roles';
import { useApp } from '@/context';
import { supabase } from '@/lib/supabase';
import { getMeGo, type MeGo } from '@/services/api-go';

function profileFromSession(session: any, role: Role) {
  const meta = session?.user?.user_metadata ?? {};
  return {
    id: session.user.id,
    full_name: meta.nama_lengkap ?? session.user.email ?? 'Pengguna',
    email: session.user.email ?? null,
    role,
  };
}

export function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      let profile: MeGo | null = null;
      try { profile = await getMeGo(session.access_token); } catch {}
      const r = resolveRole(profile, session.user);
      if (!r) return;
      login(r, profile ? { ...profile, role: r } : profileFromSession(session, r));
      nav(homePath(r), { replace: true });
    })();
  }, [login, nav]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Email dan password wajib diisi');
    setError('');
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err || !data.user) throw new Error('Email atau password salah');
      let profile: MeGo | null = null;
      try { profile = await getMeGo(data.session?.access_token); } catch {}
      const r = resolveRole(profile, data.user);
      if (!r) { await supabase.auth.signOut(); throw new Error('Akun belum memiliki peran. Hubungi Tata Usaha.'); }
      login(r, profile ? { ...profile, role: r } : profileFromSession(data.session, r));
      nav(homePath(r), { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError('Gagal masuk dengan Google'); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* ---- Left panel ---- */}
      <div className="hidden lg:flex w-[46%] wave-bg text-white flex-col relative overflow-hidden">
        {/* Photo background */}
        <img
          src={`${import.meta.env.BASE_URL}halaman smk.jpeg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          {/* Top */}
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/90 p-1 shadow-sm"><Logo size={34} /></div>
            <span className="text-sm font-bold leading-tight opacity-90">SMK Negeri 2<br/>Indramayu</span>
          </div>

          {/* Center */}
          <div className="-mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Sistem Pembelajaran Digital</p>
            <h1 className="text-[2.4rem] font-extrabold leading-[1.1] tracking-tight">
              Belajar Lebih Mudah,<br/>Kapan Saja.
            </h1>
            <p className="mt-4 text-white/55 text-[15px] leading-relaxed max-w-xs">
              Portal terpadu untuk kelas, ujian, penugasan, dan presensi siswa.
            </p>
          </div>

          {/* Photo card */}
          <div className="rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-lg">
            <img
              src={`${import.meta.env.BASE_URL}halaman smk.jpeg`}
              alt="SMK Negeri 2 Indramayu"
              className="w-full h-44 object-cover"
            />
          </div>
        </div>
      </div>

      {/* ---- Right panel ---- */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <Logo size={40} />
              <span className="font-bold text-sm text-left leading-tight">SMK Negeri 2<br/>Indramayu</span>
            </div>
            <p className="text-xs text-muted">Sistem Pembelajaran Digital</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-line p-7 sm:p-8">
            <h2 className="text-xl font-extrabold text-ink">Masuk ke Akun</h2>
            <p className="text-sm text-muted mt-1 mb-6">Gunakan email atau NISN/NIP terdaftar.</p>

            {error && (
              <div className="mb-5 px-3.5 py-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold mb-1.5 block">Email / NISN / NIP</span>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="text"
                  autoComplete="username"
                  placeholder="nama@email.com"
                  className="w-full h-11 rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition focus:ring-4 focus:ring-primary/20 focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-semibold">Kata Sandi</span>
                  <Link to="/lupa-sandi" className="text-xs font-semibold text-primary hover:underline">Lupa?</Link>
                </span>
                <div className="relative">
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full h-11 rounded-xl border border-line bg-white px-3.5 pr-10 text-sm outline-none transition focus:ring-4 focus:ring-primary/20 focus:border-primary"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Memproses…' : 'Masuk'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-line" />
              <span className="text-xs text-muted">atau</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={googleLogin}
              disabled={loading}
              className="w-full h-11 rounded-xl border border-line bg-white text-sm font-semibold text-ink hover:bg-gray-50 transition flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </button>
          </div>

          <p className="text-center text-[11px] text-muted mt-5">© 2026 SMK Negeri 2 Indramayu</p>
        </div>
      </div>
    </div>
  );
}
