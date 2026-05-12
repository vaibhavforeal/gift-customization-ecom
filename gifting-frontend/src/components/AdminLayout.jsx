import { Link, useLocation, useNavigate } from 'react-router-dom';
import { removeToken } from '../lib/auth';
import './AdminLayout.css';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSignOut = () => {
    removeToken();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar — desktop */}
      <aside className="admin-sidebar">
        <div>
          <div className="admin-sidebar-brand">
            <span className="font-headline-md admin-brand-text">Kasturi</span>
          </div>
          <nav className="admin-sidebar-nav">
            <Link to="/admin" className={`admin-nav-item ${isActive('/admin') && !isActive('/admin/orders') && !isActive('/admin/products') ? 'active' : ''}`}>
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
            <Link to="/admin/orders" className={`admin-nav-item ${isActive('/admin/orders') ? 'active' : ''}`}>
              <span className="material-symbols-outlined">receipt_long</span>
              Orders
            </Link>
            <Link to="/admin/products" className={`admin-nav-item ${isActive('/admin/products') ? 'active' : ''}`}>
              <span className="material-symbols-outlined">card_giftcard</span>
              Products
            </Link>
          </nav>
        </div>
        <div className="admin-sidebar-footer">
          <button onClick={handleSignOut} className="admin-signout">
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="admin-main">
        {/* Mobile header */}
        <div className="admin-mobile-header">
          <button className="admin-mobile-menu-btn">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="font-headline-lg admin-brand-text">Kasturi</span>
          <button className="admin-mobile-menu-btn">
            <span className="material-symbols-outlined">shopping_bag</span>
          </button>
        </div>

        {/* Page content */}
        <div className="admin-content">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="admin-bottom-nav">
          <Link to="/admin" className={`admin-bottom-item ${isActive('/admin') && !isActive('/admin/orders') && !isActive('/admin/products') ? 'active' : ''}`}>
            <span className="material-symbols-outlined">home</span>
            <span className="admin-bottom-label">Home</span>
          </Link>
          <Link to="/admin/products" className={`admin-bottom-item ${isActive('/admin/products') ? 'active' : ''}`}>
            <span className="material-symbols-outlined">card_giftcard</span>
            <span className="admin-bottom-label">Products</span>
          </Link>
          <Link to="/admin/orders" className={`admin-bottom-item ${isActive('/admin/orders') ? 'active' : ''}`}>
            <span className="material-symbols-outlined">package_2</span>
            <span className="admin-bottom-label">Orders</span>
          </Link>
          <button onClick={handleSignOut} className="admin-bottom-item">
            <span className="material-symbols-outlined">person</span>
            <span className="admin-bottom-label">Account</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
