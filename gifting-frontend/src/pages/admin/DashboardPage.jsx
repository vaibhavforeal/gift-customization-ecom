import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import './DashboardPage.css';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getOrders({ page: 1, pageSize: 5 }),
    ]).then(([statsData, ordersData]) => {
      setStats(statsData);
      setRecentOrders(ordersData.orders || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getBadgeClass = (status) => {
    const map = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PACKED: 'badge-packed', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled' };
    return map[status] || 'badge-pending';
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      {/* Desktop header */}
      <header className="dashboard-header">
        <h1 className="font-headline-lg">Dashboard</h1>
        <div className="dashboard-header-right">
          <span className="font-body-md dashboard-date">
            {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <button className="dashboard-avatar">
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats cards */}
        {stats && (
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <h3 className="font-label-md stat-label">Orders Today</h3>
                <span className="material-symbols-outlined stat-icon" style={{ color: 'var(--secondary)' }}>shopping_bag</span>
              </div>
              <p className="font-display-lg stat-value">{stats.ordersToday}</p>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <h3 className="font-label-md stat-label">Orders This Week</h3>
                <span className="material-symbols-outlined stat-icon" style={{ color: 'var(--secondary)' }}>calendar_month</span>
              </div>
              <p className="font-display-lg stat-value">{stats.ordersThisWeek}</p>
            </div>
            <div className="stat-card stat-card-highlight">
              <div className="stat-top">
                <h3 className="font-label-md stat-label">Pending Orders</h3>
                <span className="material-symbols-outlined stat-icon" style={{ color: 'var(--primary)' }}>pending_actions</span>
              </div>
              <p className="font-display-lg stat-value" style={{ color: 'var(--primary)' }}>{stats.pendingOrders}</p>
            </div>
            <div className="stat-card stat-card-error">
              <div className="stat-top">
                <h3 className="font-label-md stat-label" style={{ color: 'var(--error)' }}>Unpaid Orders</h3>
                <span className="material-symbols-outlined stat-icon" style={{ color: 'var(--error)' }}>payments</span>
              </div>
              <p className="font-display-lg stat-value" style={{ color: 'var(--error)' }}>{stats.unpaidOrders}</p>
            </div>
          </section>
        )}

        {/* Recent orders */}
        <section className="recent-orders card">
          <div className="recent-orders-header">
            <h2 className="font-headline-md">Recent Orders</h2>
            <Link to="/admin/orders" className="font-label-md recent-orders-link">View all</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="font-label-md">Order ID</th>
                  <th className="font-label-md">Customer</th>
                  <th className="font-label-md">Date</th>
                  <th className="font-label-md">Amount</th>
                  <th className="font-label-md">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="order-id-link">{order.orderNumber}</Link>
                    </td>
                    <td>{order.customerName}</td>
                    <td style={{ color: 'var(--on-surface-variant)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>₹{Number(order.subtotal).toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${getBadgeClass(order.status)}`}>{order.status}</span></td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '32px' }}>No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
