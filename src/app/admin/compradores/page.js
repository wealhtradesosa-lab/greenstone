'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

export default function AdminCompradores() {
  const { profile, loading, supabase } = useAuth();
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data } = await supabase
        .from('buyers')
        .select('*, profiles(email, status, full_name)')
        .order('created_at', { ascending: false });
      setBuyers(data || []);
    };
    load();
  }, [profile]);

  const toggleStatus = async (buyer) => {
    const newStatus = buyer.profiles?.status === 'activo' ? 'suspendido' : 'activo';
    await supabase.from('profiles').update({ status: newStatus }).eq('id', buyer.user_id);
    setBuyers(prev => prev.map(b => b.id === buyer.id
      ? { ...b, profiles: { ...b.profiles, status: newStatus } } : b));
  };

  if (loading) return <div className="min-h-screen bg-ivory flex items-center justify-center">
    <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
  </div>;

  return (
    <div className="min-h-screen bg-ivory">
      <DashboardNavbar profile={profile} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-charcoal mb-6">Buyers CRM</h1>
        <div className="gs-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5">
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Company</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Contact</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Type</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Tier</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Total Purchases</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Status</th>
                <th className="text-right px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map(b => (
                <tr key={b.id} className="border-b border-black/[0.03] hover:bg-pearl/50">
                  <td className="px-4 py-3">
                    <div className="font-body text-sm font-medium text-charcoal">{b.company_name}</div>
                    <div className="font-body text-xs text-warm-gray">{b.city}, {b.country}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-body text-sm text-charcoal">{b.profiles?.full_name}</div>
                    <div className="font-body text-xs text-warm-gray">{b.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-warm-gray">{b.buyer_type?.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs font-bold tracking-wider ${
                      b.tier === 'platinum' ? 'text-purple-600' :
                      b.tier === 'gold' ? 'text-amber-600' :
                      b.tier === 'silver' ? 'text-gray-500' : 'text-orange-700'
                    }`}>{b.tier?.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-charcoal">${b.total_purchases?.toLocaleString() || '0'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      b.profiles?.status === 'activo' ? 'bg-emerald-50 text-emerald-700' :
                      b.profiles?.status === 'pendiente' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-600'
                    }`}>{b.profiles?.status?.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleStatus(b)}
                      className={`font-body text-xs font-medium px-3 py-1.5 rounded border transition-all ${
                        b.profiles?.status === 'activo'
                          ? 'border-red-200 text-red-500 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}>
                      {b.profiles?.status === 'activo' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {buyers.length === 0 && <div className="text-center py-12"><p className="font-body text-sm text-warm-gray">No buyers yet</p></div>}
        </div>
      </main>
    </div>
  );
}
