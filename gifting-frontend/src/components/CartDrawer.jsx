import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import { publicApi } from '../lib/api';
import './CartDrawer.css';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    cartItems,
    quote,
    quoteLoading,
    totalItems,
    addToCart,
    removeFromCart,
    removeProduct,
    clearCart,
    drawerOpen,
    closeDrawer,
  } = useCart();

  const [products, setProducts] = useState([]);

  // Fetch product details for items in cart
  useEffect(() => {
    if (cartItems.length === 0) {
      setProducts([]);
      return;
    }
    publicApi.getProducts().then((data) => {
      setProducts(data.products || []);
    }).catch(() => {});
  }, [cartItems.length]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const getCartProduct = (productId) => products.find((p) => p.id === productId);

  const getItemPrice = (productId) => {
    if (!quote?.items) return null;
    const qi = quote.items.find((i) => i.productId === productId);
    return qi ? Number(qi.subtotal) : null;
  };

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`cart-drawer ${drawerOpen ? 'open' : ''}`} aria-label="Shopping cart">
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-row">
            <span className="material-symbols-outlined cart-drawer-icon">shopping_bag</span>
            <h2 className="font-headline-md cart-drawer-title">Your Hamper</h2>
          </div>
          <button className="cart-drawer-close" onClick={closeDrawer} aria-label="Close cart">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <span className="material-symbols-outlined cart-empty-icon">package_2</span>
              <p className="font-headline-md cart-empty-title">Your hamper is empty</p>
              <p className="font-body-md cart-empty-subtitle">
                Start building your perfect gift hamper!
              </p>
              <button
                className="btn-primary"
                onClick={() => { closeDrawer(); navigate('/build'); }}
              >
                Browse items
              </button>
            </div>
          ) : (
            <ul className="cart-items-list">
              {cartItems.map(({ productId, quantity }) => {
                const product = getCartProduct(productId);
                const itemPrice = getItemPrice(productId);

                return (
                  <li key={productId} className="cart-item">
                    <div className="cart-item-img-wrap">
                      {product?.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product?.name || 'Product'}
                          className="cart-item-img"
                        />
                      ) : (
                        <div className="cart-item-img-placeholder">
                          <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-top">
                        <h4 className="font-label-md cart-item-name">
                          {product?.name || 'Loading...'}
                        </h4>
                        <button
                          className="cart-item-remove"
                          onClick={() => removeProduct(productId)}
                          aria-label={`Remove ${product?.name || 'item'}`}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                      <div className="cart-item-bottom">
                        <div className="cart-item-qty">
                          <button
                            className="qty-btn"
                            onClick={() => removeFromCart(productId)}
                          >
                            −
                          </button>
                          <span className="qty-value">{quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => addToCart(productId)}
                          >
                            +
                          </button>
                        </div>
                        {itemPrice !== null && (
                          <span className="font-label-md cart-item-price">
                            ₹{itemPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-footer-row">
              <button className="cart-clear-btn" onClick={clearCart}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete_sweep</span>
                Clear all
              </button>
            </div>
            <div className="cart-footer-total">
              <div>
                <span className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
                <p className="font-headline-md cart-total-amount">
                  {quoteLoading ? (
                    <span className="cart-total-loading">Calculating...</span>
                  ) : quote ? (
                    <>₹{Number(quote.subtotal).toLocaleString('en-IN')}</>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <button className="btn-primary cart-checkout-btn" onClick={handleCheckout}>
                Checkout
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
