import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import './BottomNav.css';

export default function BottomNav() {
  const location = useLocation();
  const { totalItems, openDrawer } = useCart();

  const isActive = (paths) => paths.some((p) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p)));

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bottom-nav-item ${isActive(['/']) && !isActive(['/build', '/tracking', '/checkout', '/confirmation']) ? 'active' : ''}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive(['/']) && !isActive(['/build', '/tracking', '/checkout', '/confirmation']) ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span className="bottom-nav-label">Home</span>
      </Link>
      <Link to="/build" className={`bottom-nav-item ${isActive(['/build']) ? 'active' : ''}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive(['/build']) ? "'FILL' 1" : "'FILL' 0" }}>card_giftcard</span>
        <span className="bottom-nav-label">Build</span>
      </Link>
      <button onClick={openDrawer} className="bottom-nav-item bottom-nav-cart-btn">
        <span className="bottom-nav-cart-icon-wrap">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>shopping_bag</span>
          {totalItems > 0 && (
            <span className="bottom-nav-badge">{totalItems > 99 ? '99+' : totalItems}</span>
          )}
        </span>
        <span className="bottom-nav-label">Cart</span>
      </button>
      <Link to="/tracking" className={`bottom-nav-item ${isActive(['/tracking', '/confirmation']) ? 'active' : ''}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive(['/tracking', '/confirmation']) ? "'FILL' 1" : "'FILL' 0" }}>package_2</span>
        <span className="bottom-nav-label">Orders</span>
      </Link>
    </nav>
  );
}
