import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import { setToken, setAdmin } from '../../lib/auth';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.login(email, password);
      setToken(data.token);
      setAdmin(data.admin);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-card card">
          {/* Decorative top */}
          <div className="login-decoration">
            <div className="login-line"></div>
            <svg className="login-star" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1"></path>
              <circle cx="12" cy="12" fill="currentColor" fillOpacity="0.5" r="2"></circle>
            </svg>
            <div className="login-line"></div>
          </div>

          <h1 className="font-headline-lg login-brand">Kasturi</h1>

          {error && (
            <div className="login-error">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="input-label" htmlFor="email">Email</label>
              <input
                className="input-field tactile-input-login"
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@kasturi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="input-label" htmlFor="password">Password</label>
              <div className="login-password-wrap">
                <input
                  className="input-field tactile-input-login"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="login-toggle-pw"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary login-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="font-caption login-note">Admin access only.</p>
        </div>
      </div>
    </main>
  );
}
