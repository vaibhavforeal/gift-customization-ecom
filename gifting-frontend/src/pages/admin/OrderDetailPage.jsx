import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import './OrderDetailPage.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = () => {
    adminApi.getOrder(id).then((data) => {
      setOrder(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const updateStatus = async (field, value) => {
    setUpdating(true);
    try {
      await adminApi.updateOrder(id, { [field]: value });
      fetchOrder();
    } catch { /* ignore */ }
    setUpdating(false);
  };

  const getBadgeClass = (status) => {
    const m = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PACKED: 'badge-packed', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled' };
    return m[status] || 'badge-pending';
  };

  if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>Loading order...</div>;
  if (!order) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--error)' }}>Order not found.</div>;

  return (
    <div className="order-detail-page">
      <div className="order-detail-back">
        <Link to="/admin/orders" className="order-back-link font-label-md">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span> Orders
        </Link>
      </div>

      <div className="order-detail-title-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1 className="font-display-lg-mobile">Order {order.orderNumber}</h1>
          <span className={`badge ${getBadgeClass(order.status)}`}>{order.status}</span>
        </div>
      </div>

      <div className="order-detail-grid">
        <div className="order-detail-main">
          {/* Customer */}
          <div className="card" style={{ padding: 'var(--stack-md)' }}>
            <h2 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: 'var(--stack-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">person</span> Customer Details
            </h2>
            <div className="order-detail-row"><span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Name</span><span>{order.customerName}</span></div>
            <div className="order-detail-row"><span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Phone</span><span>{order.customerPhone}</span></div>
            {order.customerEmail && <div className="order-detail-row"><span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Email</span><span>{order.customerEmail}</span></div>}
            <div className="order-detail-row"><span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Address</span><span>{order.shippingAddress}</span></div>
            {order.occasion && <div className="order-detail-row"><span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Occasion</span><span>{order.occasion}</span></div>}
            {order.notes && <div className="order-detail-row"><span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Notes</span><span>{order.notes}</span></div>}
          </div>

          {/* Items */}
          <div className="card" style={{ padding: 'var(--stack-md)', marginTop: 'var(--stack-md)' }}>
            <h2 className="font-headline-md" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined">shopping_cart</span> Ordered Items
            </h2>
            {order.items?.map((item) => (
              <div key={item.id} className="order-item-row">
                {item.product?.imageUrl && <img src={item.product.imageUrl} alt={item.product?.name} className="order-item-img" />}
                <div style={{ flex: 1 }}>
                  <p className="font-body-md" style={{ fontWeight: 500 }}>{item.product?.name || 'Product'}</p>
                  <p className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>Qty: {item.quantity} × ₹{Number(item.unitPrice).toLocaleString('en-IN')}</p>
                </div>
                <span className="font-body-md" style={{ fontWeight: 600 }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(221,192,185,0.3)', paddingTop: '16px', marginTop: '16px' }}>
              <span className="font-headline-md" style={{ color: 'var(--primary)' }}>Total</span>
              <span className="font-headline-md" style={{ color: 'var(--primary)' }}>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="order-detail-sidebar">
          <div className="card" style={{ padding: 'var(--stack-md)' }}>
            <h3 className="font-label-md" style={{ marginBottom: '16px' }}>Update Status</h3>
            <div className="form-group">
              <label className="input-label">Order Status</label>
              <select className="input-field" value={order.status} onChange={(e) => updateStatus('status', e.target.value)} disabled={updating}>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PACKED">Packed</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="input-label">Payment Status</label>
              <select className="input-field" value={order.paymentStatus} onChange={(e) => updateStatus('paymentStatus', e.target.value)} disabled={updating}>
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <p className="font-caption" style={{ color: 'var(--on-surface-variant)', marginTop: '12px' }}>
              Created {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
