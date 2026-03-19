'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

export default function AdminProveedores() {
  const { profile, loading, supabase } = useAuth();
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data } = await supabase
        .from('suppliers')
        .select('*, profiles(email, status, full_name)')
        .order('created_at', { ascending: false });
      setSuppliers(data || []);
    };
    load();
  }, [profile]);

  const toggleStatus = async (supplier) => {
    const newStatus = supplier.profiles?.status === 'activo' ? 'suspendido' : 'activo';
    await supabase.from('profiles').update({ status: newStatus }).eq('id', supplier.user_id);
    setSuppliers(prev => prev.map(s => s.id === supplier.id
      ? { ...s, profiles: { ...s.profiles, status: newStatus } } : s));
  };

  if (loading) return <div className="min-h-screen bg-ivory flex items-center justify-center">
    <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
  </div>;

  return (
    <div className="min-h-screen bg-ivory">
      <DashboardNavbar profile={profile} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-charcoal mb-6">Suppliers</h1>
        <div className="gs-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/5">
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Company</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Contact</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Location</th>
                <th className="text-left px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Status</th>
                <th className="text-right px-4 py-3 font-body text-[10px] font-semibold tracking-wider text-warm-gray uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id} className="border-b border-black/[0.03] hover:bg-pearl/50">
                  <td className="px-4 py-3">
                    <div className="font-body text-sm font-medium text-charcoal">{s.company_name}</div>
                    <div className="font-body text-xs text-warm-gray">{s.tax_id || '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-body text-sm text-charcoal">{s.profiles?.full_name}</div>
                    <div className="font-body text-xs text-warm-gray">{s.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-warm-gray">{s.city}, {s.country}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                      s.profiles?.status === 'activo' ? 'bg-emerald-50 text-emerald-700' :
                      s.profiles?.status === 'pendiente' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-600'
                    }`}>{s.profiles?.status?.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleStatus(s)}
                      className={`font-body text-xs font-medium px-3 py-1.5 rounded border transition-all ${
                        s.profiles?.status === 'activo'
                          ? 'border-red-200 text-red-500 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}>
                      {s.profiles?.status === 'activo' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {suppliers.length === 0 && <div className="text-center py-12"><p className="font-body text-sm text-warm-gray">No suppliers yet</p></div>}
        </div>
      </main>
    </div>
  );
}
