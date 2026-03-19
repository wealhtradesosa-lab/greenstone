'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' 
        ? 'Correo o contraseña incorrectos' 
        : authError.message);
      setLoading(false);
      return;
    }

    // Get user role to redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', data.user.id)
      .single();

    if (profile?.status === 'pendiente') {
      setError('Tu cuenta está pendiente de aprobación. Te notificaremos por correo cuando sea activada.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (profile?.status === 'suspendido') {
      setError('Tu cuenta ha sido suspendida. Contacta a soporte.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // Redirect by role
    switch (profile?.role) {
      case 'super_admin':
      case 'admin_comercial':
        router.push('/admin');
        break;
      case 'proveedor':
        router.push('/proveedor');
        break;
      case 'comprador':
        router.push('/catalogo');
        break;
      default:
        router.push('/catalogo');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(165deg, #070F0B 0%, #0D2E1E 50%, #070F0B 100%)' }}>
      {/* Left - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
              <path d="M10 0L14 7H6L10 0Z" fill="#C8A951" opacity="0.8"/>
              <path d="M6 7H14L10 20L6 7Z" fill="#C8A951"/>
            </svg>
            <span className="font-elegant text-2xl font-semibold tracking-[0.15em] text-ivory">GREENSTONE</span>
          </div>
          <h2 className="font-display text-4xl font-normal text-ivory leading-tight mb-4">
            Welcome back to the <em className="italic text-emerald-glow">marketplace</em>
          </h2>
          <p className="font-elegant text-lg text-white/35 leading-relaxed">
            Access your curated catalog, manage your inventory, and close deals with confidence.
          </p>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path d="M10 0L14 7H6L10 0Z" fill="#C8A951" opacity="0.8"/>
              <path d="M6 7H14L10 20L6 7Z" fill="#C8A951"/>
            </svg>
            <span className="font-elegant text-xl font-semibold tracking-[0.15em] text-ivory">GREENSTONE</span>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-lg p-8 md:p-10">
            <h1 className="font-display text-2xl text-ivory mb-1">Sign In</h1>
            <p className="font-body text-sm text-white/30 mb-8">Enter your credentials to access the platform</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded px-4 py-3 mb-6">
                <p className="font-body text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="gs-label !text-white/40">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="gs-input !bg-white/5 !border-white/10 !text-ivory placeholder:text-white/20 focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="gs-label !text-white/40">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="gs-input !bg-white/5 !border-white/10 !text-ivory placeholder:text-white/20 focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="gs-btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center mt-6 font-body text-sm text-white/30">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-gold hover:text-gold-light transition-colors font-medium">
                Request Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
