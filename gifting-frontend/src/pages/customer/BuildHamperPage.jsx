import { useState, useEffect } from 'react';
import { publicApi } from '../../lib/api';
import { useCart } from '../../lib/CartContext';
import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import './BuildHamperPage.css';

export default function BuildHamperPage() {
  const { cart, quote, totalItems, addToCart, removeFromCart, openDrawer } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    publicApi.getProducts().then((data) => {
      setProducts(data.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...new Set(products.map((p) => p.category))];

  const filteredProducts = activeCategory === 'ALL'
    ? products
    : products.filter((p) => p.category === activeCategory);

  const getMinPrice = (product) => {
    if (!product.pricingTiers || product.pricingTiers.length === 0) return '—';
    const prices = product.pricingTiers.map((t) => Number(t.unitPrice));
    return `₹${Math.min(...prices)}`;
  };

  return (
    <div className="build-page">
      <Navbar />
      <main className="build-main">
        {/* Step header */}
        <section className="build-step-header">
          <p className="font-label-md build-step-label">Step 1 of 3</p>
          <h1 className="font-headline-lg build-step-title">Pick your items</h1>
          <div className="build-progress">
            <div className="build-progress-bar active"></div>
            <div className="build-progress-bar"></div>
            <div className="build-progress-bar"></div>
          </div>
        </section>

        {/* Category filters */}
        <div className="build-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`build-category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="build-content">
          <section className="build-grid-section">
            {loading ? (
              <p style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>No products found.</p>
            ) : (
              <div className="build-grid">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="product-card card">
                    <div className="product-img-wrap">
                      <img
                        alt={product.name}
                        className="product-img"
                        src={product.imageUrl}
                      />
                    </div>
                    <div className="product-info">
                      <h3 className="font-headline-md product-name">{product.name}</h3>
                      <p className="font-body-md product-desc">{product.description}</p>
                      <div className="product-footer">
                        <span className="font-label-md product-price">{getMinPrice(product)}</span>
                        <div className="product-cart-controls">
                          {cart[product.id] ? (
                            <div className="qty-controls">
                              <button className="qty-btn" onClick={() => removeFromCart(product.id)}>−</button>
                              <span className="qty-value">{cart[product.id]}</span>
                              <button className="qty-btn" onClick={() => addToCart(product.id)}>+</button>
                            </div>
                          ) : (
                            <button className="btn-primary product-add-btn" onClick={() => addToCart(product.id)}>Add</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Floating hamper bar */}
      {totalItems > 0 && (
        <div className="hamper-bar">
          <div className="hamper-bar-inner">
            <div className="hamper-bar-info">
              <div className="hamper-bar-icon">
                <span className="material-symbols-outlined">package_2</span>
              </div>
              <div>
                <p className="font-label-md hamper-bar-label">Current Hamper</p>
                <p className="font-headline-md hamper-bar-total">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                  {quote && (
                    <> <span style={{ color: 'var(--outline)', margin: '0 4px' }}>·</span> ₹{Number(quote.subtotal).toLocaleString('en-IN')}</>
                  )}
                </p>
              </div>
            </div>
            <button className="btn-secondary" onClick={openDrawer}>
              View hamper
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
