import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import './EditProductPage.css';

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'TERRACOTTA',
    imageUrl: '',
    isActive: true,
  });
  const [tiers, setTiers] = useState([{ minQty: 1, maxQty: null, unitPrice: '' }]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      adminApi.getProducts().then((data) => {
        const product = (data.products || []).find((p) => p.id === id);
        if (product) {
          setForm({
            name: product.name,
            description: product.description || '',
            category: product.category,
            imageUrl: product.imageUrl,
            isActive: product.isActive,
          });
          setTiers(product.pricingTiers.map((t) => ({
            minQty: t.minQty,
            maxQty: t.maxQty,
            unitPrice: Number(t.unitPrice),
          })));
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTierChange = (index, field, value) => {
    setTiers((prev) => prev.map((t, i) => i === index ? { ...t, [field]: value === '' ? '' : Number(value) } : t));
  };

  const addTier = () => setTiers((prev) => [...prev, { minQty: '', maxQty: null, unitPrice: '' }]);
  const removeTier = (index) => setTiers((prev) => prev.filter((_, i) => i !== index));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await adminApi.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch {
      setError('Image upload failed.');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      pricingTiers: tiers.map((t) => ({
        minQty: Number(t.minQty),
        maxQty: t.maxQty === '' || t.maxQty === null ? null : Number(t.maxQty),
        unitPrice: Number(t.unitPrice),
      })),
    };

    try {
      if (isNew) {
        await adminApi.createProduct(payload);
      } else {
        await adminApi.updateProduct(id, payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product.');
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '48px', color: 'var(--on-surface-variant)', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="edit-product-page">
      {/* Breadcrumb (desktop) */}
      <header className="edit-product-header">
        <div className="breadcrumb">
          <Link to="/admin/products" className="breadcrumb-link">Products</Link>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
          <span>{isNew ? 'New Product' : form.name}</span>
        </div>
      </header>

      <div className="edit-product-content">
        <div className="edit-product-inner">
          <div className="edit-product-title-section">
            <div>
              <h2 className="font-headline-lg">{isNew ? 'Add product' : 'Edit product'}</h2>
              <p className="font-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                {isNew ? 'Fill in the details for the new product.' : 'Update details and pricing tiers for this item.'}
              </p>
            </div>
          </div>

          {error && (
            <div className="checkout-error" style={{ marginBottom: 'var(--stack-md)' }}>
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="edit-product-grid">
              <div className="edit-product-main">
                {/* Basic details */}
                <div className="edit-section card">
                  <h3 className="font-label-md" style={{ marginBottom: '16px' }}>Basic Details</h3>
                  <div className="form-group">
                    <label className="input-label">Product Name</label>
                    <input className="input-field tactile-input" name="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="input-label">Description</label>
                    <textarea className="input-field tactile-input" name="description" rows="3" value={form.description} onChange={handleChange}></textarea>
                  </div>
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="input-label">Category</label>
                    <select className="input-field" name="category" value={form.category} onChange={handleChange}>
                      <option value="TERRACOTTA">Terracotta</option>
                      <option value="SWEET">Sweet</option>
                      <option value="DRYFRUIT">Dry Fruit</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                      Active (visible to customers)
                    </label>
                  </div>
                </div>

                {/* Image */}
                <div className="edit-section card" style={{ marginTop: 'var(--stack-md)' }}>
                  <h3 className="font-label-md" style={{ marginBottom: '16px' }}>Product Image</h3>
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="Preview" className="edit-product-preview" />
                  )}
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    {uploading && <span className="font-caption" style={{ color: 'var(--on-surface-variant)' }}>Uploading...</span>}
                  </div>
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label className="input-label">Or paste URL</label>
                    <input className="input-field" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
                  </div>
                </div>

                {/* Pricing tiers */}
                <div className="edit-section card" style={{ marginTop: 'var(--stack-md)' }}>
                  <h3 className="font-label-md" style={{ marginBottom: '16px' }}>Pricing Tiers</h3>
                  {tiers.map((tier, i) => (
                    <div key={i} className="tier-row">
                      <div className="form-group">
                        <label className="input-label">Min Qty</label>
                        <input className="input-field" type="number" min="1" value={tier.minQty} onChange={(e) => handleTierChange(i, 'minQty', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="input-label">Max Qty</label>
                        <input className="input-field" type="number" placeholder="∞" value={tier.maxQty ?? ''} onChange={(e) => handleTierChange(i, 'maxQty', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="input-label">Unit Price (₹)</label>
                        <input className="input-field" type="number" min="0" step="0.01" value={tier.unitPrice} onChange={(e) => handleTierChange(i, 'unitPrice', e.target.value)} required />
                      </div>
                      {tiers.length > 1 && (
                        <button type="button" className="tier-remove" onClick={() => removeTier(i)}>
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn-outline" style={{ marginTop: '12px' }} onClick={addTier}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    Add tier
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="edit-product-actions">
              <Link to="/admin/products" className="btn-outline">Cancel</Link>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
