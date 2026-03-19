'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const ORDER_LABELS = {
  orden_creada: 'Created', pago_pendiente: 'Payment Pending', pago_confirmado: 'Paid',
  en_preparacion: 'Preparing', enviada: 'Shipped', entregada: 'Delivered',
  completada: 'Completed', en_disputa: 'Dispute', cancelada: 'Cancelled',
};

export default function ProveedorOrdenes() {
  const { profile, loading, supabase } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data: s } = await supabase.from('suppliers').select('id').eq('user_id', profile.id).single();
      if (s) {
        const { data } = await supabase.from('orders')
          .select('*, emeralds(commercial_name, internal_code), buyers(company_name)')
          .eq('supplier_id', s.id)
          .order('created_at', { ascending: false });
        setOrders(data || []);
      }
    };
    load();
  }, [profile]);

  if (loading) return <div className="min-h-screen bg-ivory flex items-center justify-center">
    <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
  </div>;

  return (
    <div className="min-h-screen bg-ivory">
      <DashboardNavbar profile={profile} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-charcoal mb-6">My Orders</h1>
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="gs-card p-5 flex items-center justify-between">
              <div>
                <div className="font-mono text-sm font-bold text-charcoal">{o.order_number}</div>
                <div className="font-body text-xs text-warm-gray mt-1">
                  {o.emeralds?.commercial_name || o.emeralds?.internal_code}
                  {' '}· Buyer: {o.buyers?.company_name}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-blue-50 text-blue-700">
                  {ORDER_LABELS[o.status] || o.status}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="gs-card p-12 text-center">
              <p className="font-body text-sm text-warm-gray">No orders yet. Once your stones are sold, orders will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
