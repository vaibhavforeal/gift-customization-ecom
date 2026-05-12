import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import './Navbar.css';

export default function Navbar({ hideNav = false, showBack = false, onBack }) {
  const location = useLocation();
  const { totalItems, openDrawer } = useCart();

  return (
    <header className="navbar">
      {showBack ? (
        <button onClick={onBack} aria-label="Back" className="navbar-icon-btn">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      ) : (
        <button aria-label="Menu" className="navbar-icon-btn navbar-menu-btn">
          <span className="material-symbols-outlined">menu</span>
        </button>
      )}

      {!hideNav && !showBack && (
        <div className="navbar-links">
          <nav className="navbar-nav">
            <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/build" className={`navbar-link ${location.pathname === '/build' ? 'active' : ''}`}>Build</Link>
            <Link to="/tracking" className={`navbar-link ${location.pathname.startsWith('/tracking') ? 'active' : ''}`}>Orders</Link>
          </nav>
        </div>
      )}

      <Link
        to="/"
        className={`navbar-brand ${!hideNav && !showBack ? 'navbar-brand-center' : 'navbar-brand-full'}`}
      >
        Kasturi
      </Link>

      {!hideNav && (
        <div className="navbar-actions">
          <div className="navbar-account-link">
            <Link to="/" className="navbar-link">Account</Link>
          </div>
          <button
            onClick={openDrawer}
            aria-label="Shopping Bag"
            className="navbar-icon-btn navbar-bag"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {totalItems > 0 && (
              <span className="navbar-bag-badge">{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </button>
        </div>
      )}
    </header>
  );
}
