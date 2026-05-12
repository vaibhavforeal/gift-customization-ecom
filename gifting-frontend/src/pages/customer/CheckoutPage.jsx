import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../../lib/api';
import { useCart } from '../../lib/CartContext';
import Navbar from '../../components/Navbar';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, quote, quoteLoading, totalItems, clearCart } = useCart();

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    shippingAddress: '',
    occasion: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (totalItems === 0) {
      navigate('/build', { replace: true });
    }
  }, [totalItems, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const orderData = {
        ...form,
        items: cartItems,
      };
      const result = await publicApi.createOrder(orderData);
      clearCart();
      navigate(`/confirmation/${result.orderId}`, {
        state: { order: result },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (totalItems === 0) return null;

  return (
    <div className="checkout-page">
      <Navbar hideNav={true} showBack={true} onBack={() => navigate(-1)} />
      <main className="checkout-main">
        <div className="checkout-header">
          <h1 className="font-display-lg-mobile checkout-title">Almost there.</h1>
          <p className="font-body-md checkout-subtitle">Complete your order details below.</p>
        </div>

        {/* Order Summary from global cart quote */}
        {quote && (
          <div className="checkout-summary card">
            <h3 className="font-label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '12px' }}>Order Summary</h3>
            {quote.items?.map((item) => (
              <div key={item.productId} className="checkout-summary-item">
                <span className="font-body-md">{item.productName} × {item.quantity}</span>
                <span className="font-body-md" style={{ fontWeight: 500 }}>₹{Number(item.subtotal).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="checkout-summary-total">
              <span className="font-headline-md" style={{ color: 'var(--primary)' }}>Total</span>
              <span className="font-headline-md" style={{ color: 'var(--primary)' }}>₹{Number(quote.subtotal).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        {quoteLoading && (
          <div className="checkout-summary card" style={{ textAlign: 'center', padding: '24px' }}>
            <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>Calculating your order total...</p>
          </div>
        )}

        {error && (
          <div className="checkout-error">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label" htmlFor="customerName">Full name *</label>
            <input className="input-field" id="customerName" name="customerName" type="text" required value={form.customerName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="input-label" htmlFor="customerPhone">Phone number *</label>
            <input className="input-field" id="customerPhone" name="customerPhone" type="tel" required value={form.customerPhone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="input-label" htmlFor="customerEmail">Email</label>
            <input className="input-field" id="customerEmail" name="customerEmail" type="email" value={form.customerEmail} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="input-label" htmlFor="shippingAddress">Shipping address *</label>
            <textarea className="input-field" id="shippingAddress" name="shippingAddress" rows="3" required value={form.shippingAddress} onChange={handleChange}></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="input-label" htmlFor="occasion">Occasion</label>
              <select className="input-field" id="occasion" name="occasion" value={form.occasion} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="pre-wedding">Pre-Wedding</option>
                <option value="wedding">Wedding</option>
                <option value="house-warming">House-Warming</option>
                <option value="festival">Festival</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="input-label" htmlFor="notes">Special instructions</label>
            <textarea className="input-field" id="notes" name="notes" rows="2" placeholder="e.g. Please pack with red ribbon" value={form.notes} onChange={handleChange}></textarea>
          </div>
          <button type="submit" className="btn-primary checkout-submit" disabled={submitting || quoteLoading}>
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>
      </main>
    </div>
  );
}
