'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const ORDER_STATES = {
  orden_creada: { label: 'Created', color: 'bg-blue-50 text-blue-700', next: 'pago_pendiente' },
  pago_pendiente: { label: 'Payment Pending', color: 'bg-yellow-50 text-yellow-700', next: 'pago_confirmado' },
  pago_confirmado: { label: 'Payment Confirmed', color: 'bg-emerald-50 text-emerald-700', next: 'en_preparacion' },
  en_preparacion: { label: 'Preparing', color: 'bg-purple-50 text-purple-700', next: 'enviada' },
  enviada: { label: 'Shipped', color: 'bg-indigo-50 text-indigo-700', next: 'entregada' },
  entregada: { label: 'Delivered', color: 'bg-teal-50 text-teal-700', next: 'completada' },
  completada: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800', next: null },
  en_disputa: { label: 'Dispute', color: 'bg-red-50 text-red-700', next: null },
  cancelada: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', next: null },
};

export default function AdminOrdenes() {
  const { profile, loading, supabase } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!profile) return;
    loadOrders();
  }, [profile]);

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, emeralds(commercial_name, internal_code), buyers(company_name), suppliers(company_name)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const advanceStatus = async (order) => {
    const nextStatus = ORDER_STATES[order.status]?.next;
    if (!nextStatus) return;

    await supabase.from('orders').update({ status: nextStatus }).eq('id', order.id);
    await supabase.from('order_status_log').insert({
      order_id: order.id,
      status: nextStatus,
      changed_by: profile.id,
    });
    loadOrders();
  };

  if (loading) {
    return <div className="min-h-screen bg-ivory flex items-center justify-center">
      <span className="inline-block w-6 h-6 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-ivory">
      <DashboardNavbar profile={profile} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-charcoal mb-6">Orders</h1>

        <div className="space-y-3">
          {orders.map(order => {
            const st = ORDER_STATES[order.status] || { label: order.status, color: 'bg-gray-100' };
            return (
              <div key={order.id} className="gs-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm font-bold text-charcoal">{order.order_number}</div>
                    <div className="font-body text-xs text-warm-gray mt-1">
                      {order.emeralds?.commercial_name || order.emeralds?.internal_code}
                      {' '}· Buyer: {order.buyers?.company_name}
                      {' '}· Supplier: {order.suppliers?.company_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-xs text-warm-gray">Final Price</div>
                      <div className="font-mono text-lg font-bold text-charcoal">${order.final_price?.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-warm-gray">Margin</div>
                      <div className="font-mono text-sm font-semibold text-emerald-mid">${order.greenstone_margin?.toLocaleString()}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${st.color}`}>{st.label}</span>
                    {st.next && (
                      <button onClick={() => advanceStatus(order)} className="gs-btn-primary !py-1.5 !px-3 !text-[10px]">
                        → {ORDER_STATES[st.next]?.label}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="gs-card p-12 text-center">
              <p className="font-body text-sm text-warm-gray">No orders yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
