import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import './ProductsPage.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    adminApi.getProducts().then((data) => {
      setProducts(data.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...new Set(products.map((p) => p.category))];
  const filtered = activeCategory === 'ALL' ? products : products.filter((p) => p.category === activeCategory);

  const getMinPrice = (product) => {
    if (!product.pricingTiers || product.pricingTiers.length === 0) return '—';
    const prices = product.pricingTiers.map((t) => Number(t.unitPrice));
    return `₹${Math.min(...prices).toLocaleString('en-IN')}`;
  };

  return (
    <div className="products-page">
      <div className="products-bg-accent"></div>

      <header className="products-header">
        <h2 className="font-headline-lg">Products</h2>
        <Link to="/admin/products/new" className="btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
          Add Product
        </Link>
      </header>

      <div className="products-filters">
        <div className="products-filter-row">
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
      </div>

      <div className="products-grid-area">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '48px', color: 'var(--on-surface-variant)' }}>Loading products...</p>
        ) : (
          <div className="products-grid">
            {filtered.map((product) => (
              <article key={product.id} className="admin-product-card card">
                <div className="admin-product-img-wrap">
                  <img alt={product.name} className="admin-product-img" src={product.imageUrl} />
                  {!product.isActive && <div className="admin-product-inactive">Inactive</div>}
                </div>
                <div className="admin-product-info">
                  <div className="admin-product-top">
                    <div>
                      <h3 className="font-headline-md admin-product-name">{product.name}</h3>
                      <p className="font-caption admin-product-cat">{product.category}</p>
                    </div>
                  </div>
                  <div className="admin-product-bottom">
                    <span className="font-body-md admin-product-price">From {getMinPrice(product)}</span>
                    <div className="admin-product-actions">
                      <Link to={`/admin/products/${product.id}`} className="admin-product-edit-btn">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
