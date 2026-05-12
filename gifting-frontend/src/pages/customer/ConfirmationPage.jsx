import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const order = location.state?.order;

  return (
    <div className="confirmation-page">
      <Navbar />
      <main className="confirmation-main">
        <section className="confirmation-content fade-in">
          <div className="confirmation-icon">
            <span className="material-symbols-outlined filled" style={{ fontSize: '64px' }}>check_circle</span>
          </div>
          <h1 className="font-display-lg-mobile confirmation-title">Order confirmed!</h1>
          <p className="font-body-md confirmation-order-num">
            Order # {order?.orderNumber || id}
          </p>
          {order && (
            <div className="confirmation-details">
              <p className="font-body-md">Items: {order.itemCount}</p>
              <p className="font-body-md">Total: ₹{Number(order.subtotal).toLocaleString('en-IN')}</p>
            </div>
          )}
        </section>
        <section className="confirmation-actions">
          <button
            onClick={() => navigate(`/tracking/${order?.orderId || id}`)}
            className="btn-primary confirmation-track-btn"
          >
            Track your order
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-outline confirmation-home-btn"
          >
            Back to home
          </button>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
