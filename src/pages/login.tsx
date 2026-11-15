import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/layouts';
import { ROLES, useApp, type Role, supabase } from '@/store';

export function Login() {
  const { login } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        const r = (profile?.role?.toLowerCase() || 'siswa') as Role;
        login(r, null);
        nav(ROLES[r].base + (r === 'tu' ? '/dashboard' : '/beranda'));
      }
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
      // 1. Authenticate with Supabase Auth (via REST API)
      const res = await fetch('https://phtqlmidfaocacphblej.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjI0NTksImV4cCI6MjEwNjQzODQ1OX0.8mlV5OrWgBJUWEzejGQHnVxsZqidwPwkq-tH3w_WNtg',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: username, password: password })
      });

      if (!res.ok) throw new Error('Username atau password salah');
      
      const authData = await res.json();
      
      // 2. Fetch role dari tabel profiles (pakai service role key agar tidak terblokir RLS)
      const profileRes = await fetch(`https://phtqlmidfaocacphblej.supabase.co/rest/v1/profiles?id=eq.${authData.user.id}&select=role`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2MjQ1OSwiZXhwIjoyMTA2NDM4NDU5fQ.o5iFuaMdkCMK1b8a9ulmxSX8hLDMyQl5tbmcG3wTYRo',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBodHFsbWlkZmFvY2FjcGhibGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg2MjQ1OSwiZXhwIjoyMTA2NDM4NDU5fQ.o5iFuaMdkCMK1b8a9ulmxSX8hLDMyQl5tbmcG3wTYRo'
        }
      });
      
      const profiles = await profileRes.json();
      const dbRole = profiles[0]?.role;
      const r: Role =
        dbRole === 'Tata Usaha' ? 'tu' :
        dbRole === 'Guru Mapel' ? 'guru' :
        dbRole === 'Wali Kelas' ? 'wali' :
        dbRole === 'Kepala Sekolah' ? 'kepsek' :
        'siswa';

      setIsLoading(false);
      login(r, null);
      nav(ROLES[r].base + (r === 'tu' ? '/dashboard' : '/beranda'));
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setError('Gagal masuk dengan Google: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center p-2 overflow-hidden">
      <div className="w-full max-w-[1050px] h-[640px] max-h-[96vh] bg-white rounded-2xl shadow-xl overflow-hidden flex">
        
        {/* Left Side - Illustration */}
        <div className="w-[480px] hidden lg:flex flex-col justify-between p-10 bg-white border-r border-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-gradient-radial from-[#0B3D5F]/20 to-transparent" />
          
          <div className="relative z-10 space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F4FF] rounded-full">
              <div className="w-2 h-2 bg-[#0B3D5F] rounded-full" />
              <span className="text-[#0B3D5F] text-xs font-semibold uppercase tracking-wide">
                LMS RESMI SMK NEGERI 2 INDRAMAYU
              </span>
            </div>
            <div className="pt-1">
              <h1 className="text-4xl font-bold leading-tight">
                <span className="text-slate-900">Permudah Interaksi Anda &<br/></span>
                <span className="text-[#0E86C7]">Siswa secara Online</span>
              </h1>
            </div>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed pt-1">
              Satu portal pintar untuk monitoring kelas, ujian online, penugasan terpadu, dan kolaborasi tanpa hambatan.
            </p>
          </div>

          <div className="relative z-10 py-6">
            <div className="bg-slate-100 rounded-2xl shadow-lg outline outline-4 outline-white overflow-hidden">
              <img 
                src={`${import.meta.env.BASE_URL}halaman smk.jpeg`}
                alt="SMK Negeri 2 Indramayu" 
                className="w-full h-56 object-cover"
              />
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#0B3D5F]" />
              <span className="text-slate-500">Tersinkronisasi Dapodik & Kemdikbud</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-slate-700 font-semibold">4.9/5</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
          <div className="flex-1 flex items-center justify-center px-0 lg:px-10">
            <div className="w-full max-w-md space-y-7">
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <Logo size={64} />
                  <span className="px-2 py-0.5 rounded-full outline outline-1 outline-gray-200 text-xs font-medium">LMS V2.4</span>
                </div>
                <div className="pt-2.5 space-y-1">
                  <h2 className="text-2xl font-bold text-slate-900">SMK Negeri 2 Indramayu</h2>
                  <p className="text-sm text-slate-500 leading-relaxed">Masuk ke akun portal akademik Anda untuk melanjutkan pembelajaran.</p>
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">{error}</div>}

              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email atau NISN/NIP</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={username} onChange={(e) => setUsername(e.target.value)} type="text" autoComplete="username" placeholder="Masukkan ID pengguna" className="w-full pl-11 pr-4 py-3 bg-white rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition outline-none text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">Kata Sandi</label>
                    <Link to="/lupa-sandi" className="text-sm font-medium text-blue-700 hover:text-blue-800">Lupa sandi?</Link>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      type={showPassword ? 'text' : 'password'} 
                      autoComplete="current-password"
                      placeholder="••••••••" 
                      className="w-full pl-11 pr-11 py-3 bg-white rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition outline-none text-sm" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-sm flex items-center justify-center gap-2 text-sm font-semibold transition disabled:opacity-50">
                  {isLoading ? 'Memproses...' : 'Masuk ke Portal'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-500">ATAU</span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleGoogleLogin}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2.5 hover:bg-slate-50 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-semibold text-slate-700">Masuk dengan Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
