import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Users,
  Shield,
} from 'lucide-react';
import { Logo } from '@/components/layouts';
import { resolveRole, homePath, type Role } from '@/lib/roles';
import { useApp } from '@/context';
import { supabase } from '@/lib/supabase';
import { getMeGo, type MeGo } from '@/services/api-go';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function profileFromSession(session: any, role: Role) {
  const meta = session?.user?.user_metadata ?? {};
  return {
    id: session.user.id,
    full_name: meta.nama_lengkap ?? session.user.email ?? 'Pengguna',
    email: session.user.email ?? null,
    role,
  };
}

const features = [
  { icon: GraduationCap, text: 'Monitoring Kelas Real-time' },
  { icon: BookOpen, text: 'Ujian & Penugasan Online' },
  { icon: Users, text: 'Kolaborasi Guru–Siswa' },
  { icon: Shield, text: 'Tersinkronisasi Dapodik' },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const checkedRef = useRef(false);

  /* Auto-login jika sesi aktif */
  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    const handleAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      let profile: MeGo | null = null;
      try {
        profile = await getMeGo(session.access_token);
      } catch {
        /* fallback ke metadata sesi */
      }
      const r = resolveRole(profile, session.user);
      if (!r) return;
      login(
        r,
        profile ? { ...profile, role: r } : profileFromSession(session, r),
      );
      nav(homePath(r), { replace: true });
    };
    handleAuth();
  }, [login, nav]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: username,
          password,
        });

      if (authError || !authData.user)
        throw new Error('Username atau password salah');

      let profile: MeGo | null = null;
      try {
        profile = await getMeGo(authData.session?.access_token);
      } catch {
        /* fallback */
      }

      const r = resolveRole(profile, authData.user);
      if (!r) {
        await supabase.auth.signOut();
        throw new Error('Akun ini belum memiliki peran. Hubungi Tata Usaha.');
      }
      login(
        r,
        profile
          ? { ...profile, role: r }
          : profileFromSession(authData.session, r),
      );
      setIsLoading(false);
      nav(homePath(r), { replace: true });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError('Gagal masuk dengan Google: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0B3D5F] via-[#0d4f7a] to-[#0E86C7] lg:bg-none">
      {/* ============ Left Hero Panel (desktop only) ============ */}
      <div className="hidden lg:flex w-[52%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-[#0B3D5F] via-[#0d4f7a] to-[#0E86C7] text-white">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-white/[0.03]" />
        <div className="absolute top-1/2 right-16 w-48 h-48 rounded-full bg-white/[0.03]" />

        {/* Top badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/15 mb-8">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-white/90">
              PORTAL AKADEMIK AKTIF
            </span>
          </div>

          <h1 className="text-[2.6rem] font-extrabold leading-[1.15] tracking-tight">
            Sistem Pembelajaran
            <br />
            <span className="text-sky-300">Digital Sekolah</span>
          </h1>

          <p className="mt-5 text-base text-white/70 leading-relaxed max-w-md">
            Satu portal pintar untuk monitoring kelas, ujian online, penugasan
            terpadu, dan kolaborasi tanpa hambatan.
          </p>
        </div>

        {/* School image */}
        <div className="relative z-10 my-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <img
              src={`${import.meta.env.BASE_URL}halaman smk.jpeg`}
              alt="SMK Negeri 2 Indramayu"
              className="w-full h-52 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D5F]/60 to-transparent" />
          </div>
        </div>

        {/* Feature chips */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/10"
            >
              <Icon size={18} className="text-sky-300 shrink-0" />
              <span className="text-sm font-medium text-white/85">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ Right Form Panel ============ */}
      <div className="flex-1 flex items-center justify-center p-5 lg:p-10 lg:bg-slate-50">
        <div className="w-full max-w-[420px] pop">
          {/* Card wrapper – white card on desktop, transparent on mobile */}
          <div className="bg-white rounded-3xl shadow-xl lg:shadow-lg p-8 sm:p-10 space-y-7 border border-white/20 lg:border-slate-200/70">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-2xl shadow-soft p-1.5 ring-1 ring-slate-100">
                  <Logo size={48} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                    SMK Negeri 2
                    <br />
                    Indramayu
                  </h2>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Masuk ke akun portal akademik Anda untuk melanjutkan
                  pembelajaran.
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Email atau NISN/NIP
                </label>
                <div className="relative group">
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                  />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan ID pengguna"
                    className="w-full h-12 pl-11 pr-4 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/15 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-slate-700">
                    Kata Sandi
                  </label>
                  <Link
                    to="/lupa-sandi"
                    className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    Lupa sandi?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                  />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full h-12 pl-11 pr-12 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/15 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses…
                  </>
                ) : (
                  <>
                    Masuk ke Portal
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">
                  ATAU
                </span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2.5 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-semibold text-slate-700">
                Masuk dengan Google
              </span>
            </button>
          </div>

          {/* Footer – outside the card */}
          <p className="text-center text-xs text-slate-400 lg:text-slate-400 mt-6">
            © {new Date().getFullYear()} SMK Negeri 2 Indramayu — Sistem
            Pembelajaran Digital
          </p>
        </div>
      </div>
    </div>
  );
}
