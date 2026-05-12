import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './lib/CartContext';
import CartDrawer from './components/CartDrawer';

// Customer pages
import LandingPage from './pages/customer/LandingPage';
import BuildHamperPage from './pages/customer/BuildHamperPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import ConfirmationPage from './pages/customer/ConfirmationPage';
import TrackingPage from './pages/customer/TrackingPage';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import EditProductPage from './pages/admin/EditProductPage';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';

// Layout & guards
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CartDrawer />
        <Routes>
          {/* Customer routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/build" element={<BuildHamperPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation/:id" element={<ConfirmationPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/tracking/:id" element={<TrackingPage />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminRoute><DashboardPage /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><ProductsPage /></AdminRoute>} />
          <Route path="/admin/products/:id" element={<AdminRoute><EditProductPage /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><OrdersPage /></AdminRoute>} />
          <Route path="/admin/orders/:id" element={<AdminRoute><OrderDetailPage /></AdminRoute>} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
