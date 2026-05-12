import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicApi } from '../../lib/api';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import Footer from '../../components/Footer';
import './TrackingPage.css';

const STEPS = [
  { key: 'PENDING', label: 'Pending', icon: 'pending_actions' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: 'check_circle' },
  { key: 'PACKED', label: 'Packed', icon: 'inventory_2' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'local_shipping' },
];

export default function TrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lookupId, setLookupId] = useState(id || '');
  const [error, setError] = useState('');

  const fetchOrder = async (orderId) => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const data = await publicApi.getOrder(orderId);
      setOrder(data);
    } catch {
      setError('Order not found. Please check the order ID.');
      setOrder(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchOrder(id);
    else setLoading(false);
  }, [id]);

  const getStepIndex = (status) => STEPS.findIndex((s) => s.key === status);
  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <div className="tracking-page">
      <Navbar showBack={!!order} onBack={() => { setOrder(null); setError(''); }} />
      <main className="tracking-main">
        {!id && !order && (
          <section className="tracking-lookup fade-in">
            <h1 className="font-display-lg-mobile tracking-lookup-title">Track your order</h1>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--stack-md)' }}>
              Enter your order ID to see the status.
            </p>
            <div className="tracking-lookup-form">
              <input
                className="input-field"
                placeholder="Paste your order ID"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
              />
              <button className="btn-primary" onClick={() => fetchOrder(lookupId)}>Track</button>
            </div>
            {error && <p className="tracking-error">{error}</p>}
          </section>
        )}

        {loading && id && (
          <p style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>Loading order...</p>
        )}

        {order && (
          <>
            <section className="tracking-header slide-up">
              <h1 className="font-display-lg-mobile tracking-title">Your hamper's journey.</h1>
              <p className="font-body-md tracking-meta">
                Order #{order.orderNumber} placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>

            <section className="tracking-stepper card slide-up">
              <div className="tracking-steps">
                {STEPS.map((step, i) => (
                  <div key={step.key} className={`tracking-step ${i <= currentStep ? 'completed' : ''} ${i === currentStep ? 'current' : ''}`}>
                    <div className="tracking-step-icon">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: i <= currentStep ? "'FILL' 1" : "'FILL' 0" }}>
                        {step.icon}
                      </span>
                    </div>
                    <span className="font-label-md tracking-step-label">{step.label}</span>
                    {i < STEPS.length - 1 && <div className={`tracking-step-line ${i < currentStep ? 'completed' : ''}`}></div>}
                  </div>
                ))}
              </div>
            </section>

            {order.status === 'CANCELLED' && (
              <div className="tracking-cancelled card">
                <span className="material-symbols-outlined" style={{ color: 'var(--error)' }}>cancel</span>
                <p className="font-body-md" style={{ color: 'var(--error)' }}>This order has been cancelled.</p>
              </div>
            )}

            <section className="tracking-details card slide-up">
              <h2 className="font-headline-md" style={{ color: 'var(--primary)', marginBottom: 'var(--stack-sm)' }}>
                <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>person</span>
                Order Details
              </h2>
              <div className="tracking-detail-row">
                <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Customer</span>
                <span className="font-body-md">{order.customerName}</span>
              </div>
              <div className="tracking-detail-row">
                <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Payment</span>
                <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid'}`}>{order.paymentStatus}</span>
              </div>
              <div className="tracking-detail-row">
                <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Total</span>
                <span className="font-headline-md" style={{ color: 'var(--primary)' }}>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
