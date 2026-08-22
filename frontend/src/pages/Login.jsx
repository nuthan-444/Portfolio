import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Key, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      // On success redirect to projects page with unlocked admin features
      navigate('/projects');
    } catch (err) {
      console.error('Login failure:', err);
      setError(err.response?.data?.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--badge-bg)',
                border: '1px solid var(--border-color)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                color: 'var(--text-primary)',
              }}
            >
              <Lock size={22} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Admin Portal Access</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Sign in with your administrator credentials to manage portfolio projects.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <Key size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '12px', padding: '12px' }}
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Protected Admin Area • Nuthan Prasad KG Portfolio
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
