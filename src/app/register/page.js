'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default function RegisterPage() {
  const [step, setStep] = useState(1); // 1: role, 2: details
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    country: 'MX',
    city: '',
    phone: '',
    buyerType: 'joyero_independiente',
  });

  const supabase = createClient();

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role: role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError('Error creating account');
      setLoading(false);
      return;
    }

    // 2. Create role-specific profile
    if (role === 'proveedor') {
      const { error: supError } = await supabase.from('suppliers').insert({
        user_id: userId,
        company_name: form.companyName,
        country: form.country,
        city: form.city,
        contact_phone: form.phone,
        contact_email: form.email,
      });
      if (supError) console.error('Supplier insert error:', supError);
    } else {
      const { error: buyError } = await supabase.from('buyers').insert({
        user_id: userId,
        company_name: form.companyName,
        buyer_type: form.buyerType,
        country: form.country,
        city: form.city,
        contact_phone: form.phone,
        contact_email: form.email,
      });
      if (buyError) console.error('Buyer insert error:', buyError);
    }

    await supabase.auth.signOut();
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(165deg, #070F0B 0%, #0D2E1E 50%, #070F0B 100%)' }}>
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-glow/10 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-ivory mb-3">Request Submitted</h1>
          <p className="font-elegant text-lg text-white/40 leading-relaxed mb-8">
            Your account is pending approval. Our team will review your application and notify you by email once activated.
          </p>
          <Link href="/login" className="gs-btn-primary">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

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
            Join the <em className="italic text-emerald-glow">trusted</em> emerald network
          </h2>
          <p className="font-elegant text-lg text-white/35 leading-relaxed">
            Whether you&apos;re a supplier looking to reach new markets or a buyer seeking verified stones, GREENSTONE connects you with confidence.
          </p>
        </div>
      </div>

      {/* Right - Form */}
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
            {/* Progress */}
            <div className="flex gap-2 mb-8">
              <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-emerald-glow' : 'bg-white/10'}`} />
              <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-emerald-glow' : 'bg-white/10'}`} />
            </div>

            {step === 1 ? (
              <>
                <h1 className="font-display text-2xl text-ivory mb-1">Request Access</h1>
                <p className="font-body text-sm text-white/30 mb-8">How will you use GREENSTONE?</p>

                <div className="space-y-4">
                  {/* Supplier card */}
                  <button
                    onClick={() => { setRole('proveedor'); setStep(2); }}
                    className="w-full text-left p-5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-glow/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-deep/40 flex items-center justify-center text-emerald-glow shrink-0 mt-0.5">
                        ⬆
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-ivory group-hover:text-emerald-glow transition-colors">I&apos;m a Supplier</h3>
                        <p className="font-body text-sm text-white/30 mt-1">
                          I have emerald inventory and want to reach verified buyers through a professional platform.
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Buyer card */}
                  <button
                    onClick={() => { setRole('comprador'); setStep(2); }}
                    className="w-full text-left p-5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-gold/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold shrink-0 mt-0.5">
                        ◈
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-ivory group-hover:text-gold transition-colors">I&apos;m a Buyer</h3>
                        <p className="font-body text-sm text-white/30 mt-1">
                          I&apos;m a jeweler, retailer, or distributor looking for verified, curated emeralds.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <p className="text-center mt-8 font-body text-sm text-white/30">
                  Already have an account?{' '}
                  <Link href="/login" className="text-gold hover:text-gold-light transition-colors font-medium">
                    Sign In
                  </Link>
                </p>
              </>
            ) : (
              <>
                <button onClick={() => setStep(1)} className="text-white/30 hover:text-white/60 text-sm mb-6 flex items-center gap-1 transition-colors">
                  ← Change role
                </button>
                <h1 className="font-display text-2xl text-ivory mb-1">
                  {role === 'proveedor' ? 'Supplier Registration' : 'Buyer Registration'}
                </h1>
                <p className="font-body text-sm text-white/30 mb-8">Complete your profile to request access</p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded px-4 py-3 mb-6">
                    <p className="font-body text-sm text-red-300">{error}</p>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="gs-label !text-white/40">Full Name</label>
                      <input type="text" required value={form.fullName} onChange={e => update('fullName', e.target.value)}
                        className="gs-input !bg-white/5 !border-white/10 !text-ivory placeholder:text-white/20 focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40"
                        placeholder="Your full name" />
                    </div>

                    <div className="col-span-2">
                      <label className="gs-label !text-white/40">Company Name</label>
                      <input type="text" required value={form.companyName} onChange={e => update('companyName', e.target.value)}
                        className="gs-input !bg-white/5 !border-white/10 !text-ivory placeholder:text-white/20 focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40"
                        placeholder="Company or business name" />
                    </div>

                    {role === 'comprador' && (
                      <div className="col-span-2">
                        <label className="gs-label !text-white/40">Business Type</label>
                        <select value={form.buyerType} onChange={e => update('buyerType', e.target.value)}
                          className="gs-input !bg-white/5 !border-white/10 !text-ivory focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40">
                          <option value="joyero_independiente">Independent Jeweler</option>
                          <option value="joyeria_retail">Retail Jewelry Store</option>
                          <option value="distribuidor">Distributor</option>
                          <option value="coleccionista">Collector</option>
                          <option value="otro">Other</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="gs-label !text-white/40">Country</label>
                      <select value={form.country} onChange={e => update('country', e.target.value)}
                        className="gs-input !bg-white/5 !border-white/10 !text-ivory focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40">
                        <option value="MX">México</option>
                        <option value="CO">Colombia</option>
                        <option value="US">United States</option>
                        <option value="BR">Brasil</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="gs-label !text-white/40">City</label>
                      <input type="text" value={form.city} onChange={e => update('city', e.target.value)}
                        className="gs-input !bg-white/5 !border-white/10 !text-ivory placeholder:text-white/20 focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40"
                        placeholder="City" />
                    </div>

                    <div className="col-span-2">
                      <label className="gs-label !text-white/40">Phone</label>
                      <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                        className="gs-input !bg-white/5 !border-white/10 !text-ivory placeholder:text-white/20 focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40"
                        placeholder="+52 555 123 4567" />
                    </div>

                    <div className="col-span-2 pt-2 border-t border-white/[0.06]">
                      <label className="gs-label !text-white/40">Email</label>
                      <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                        className="gs-input !bg-white/5 !border-white/10 !text-ivory placeholder:text-white/20 focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40"
                        placeholder="your@email.com" />
                    </div>

                    <div className="col-span-2">
                      <label className="gs-label !text-white/40">Password</label>
                      <input type="password" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)}
                        className="gs-input !bg-white/5 !border-white/10 !text-ivory placeholder:text-white/20 focus:!ring-emerald-glow/20 focus:!border-emerald-glow/40"
                        placeholder="Min. 6 characters" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="gs-btn-primary w-full flex items-center justify-center gap-2 mt-2">
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                    ) : 'Submit Application'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
