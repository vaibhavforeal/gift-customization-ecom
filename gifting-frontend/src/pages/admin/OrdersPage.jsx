import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import './OrdersPage.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = () => {
    setLoading(true);
    const params = { page, pageSize: 20 };
    if (statusFilter) params.status = statusFilter;
    if (paymentFilter) params.paymentStatus = paymentFilter;
    if (search) params.q = search;
    adminApi.getOrders(params).then((data) => {
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter, paymentFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const getBadgeClass = (status) => {
    const m = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', PACKED: 'badge-packed', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled' };
    return m[status] || 'badge-pending';
  };

  return (
    <div className="orders-page">
      <header className="orders-header">
        <div>
          <h1 className="font-display-lg orders-title">Orders</h1>
          <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
            Manage and track your artisan hamper fulfillments.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="orders-filters">
        <form onSubmit={handleSearch} className="orders-search-form">
          <input className="input-field" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: '280px' }} />
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Search</button>
        </form>
        <div className="orders-filter-selects">
          <select className="input-field" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ maxWidth: '160px' }}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select className="input-field" value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }} style={{ maxWidth: '160px' }}>
            <option value="">All Payments</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <div className="orders-table-area">
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="table-wrap" style={{ flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="font-label-md">Order #</th>
                  <th className="font-label-md">Customer</th>
                  <th className="font-label-md">Total</th>
                  <th className="font-label-md">Status</th>
                  <th className="font-label-md">Payment</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>Loading...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>No orders found.</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td><Link to={`/admin/orders/${order.id}`} className="order-id-link">{order.orderNumber}</Link></td>
                      <td>{order.customerName}</td>
                      <td style={{ fontWeight: 500 }}>₹{Number(order.subtotal).toLocaleString('en-IN')}</td>
                      <td><span className={`badge ${getBadgeClass(order.status)}`}>{order.status}</span></td>
                      <td><span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-paid' : 'badge-unpaid'}`}>{order.paymentStatus}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="orders-pagination">
              <button className="btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: '8px 16px' }}>Previous</button>
              <span className="font-body-md">Page {page} of {totalPages}</span>
              <button className="btn-outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '8px 16px' }}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
