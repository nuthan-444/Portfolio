import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, Save, CheckCircle, Loader } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { token, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    github: '',
    linkedin: '',
    twitter: '',
    email: '',
    resumeUrl: '',
    ownerName: '',
    tagline: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current config from MongoDB
  useEffect(() => {
    if (!token || !user) return;
    const fetchConfig = async () => {
      try {
        const res = await api.get('/config');
        const d = res.data;
        setFormData({
          github: d.social?.github || '',
          linkedin: d.social?.linkedin || '',
          twitter: d.social?.twitter || '',
          email: d.social?.email || '',
          resumeUrl: d.resumeUrl || '',
          ownerName: d.ownerName || '',
          tagline: d.tagline || '',
        });
      } catch (e) {
        setError('Failed to load config from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [token, user]);

  if (authLoading) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-muted)' }}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 12 }}>Authenticating...</p>
      </div>
    );
  }

  // Redirect to login if user is not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.put('/config', {
        social: {
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          email: formData.email,
        },
        resumeUrl: formData.resumeUrl,
        ownerName: formData.ownerName,
        tagline: formData.tagline,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError('Failed to save. Make sure you are logged in as admin.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center', color: 'var(--text-muted)' }}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 12 }}>Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 110, paddingBottom: 100, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              ADMIN ONLY
            </span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginTop: 8, marginBottom: 8 }}>Profile Settings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Update your social links and profile info. Saved directly to MongoDB — updates live across all pages.
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: 20, fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form
            onSubmit={handleSave}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 32,
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Nuthan Prasad KG" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline / Role</label>
              <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Full-Stack Developer & AI/ML Engineer" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Github size={16} /> GitHub URL
              </label>
              <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/yourusername" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Linkedin size={16} /> LinkedIn URL
              </label>
              <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/yourusername" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Twitter size={16} /> Twitter / X URL
              </label>
              <input type="url" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/yourusername" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={16} /> Contact Email
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="form-input" />
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label">Resume / CV URL (optional)</label>
              <input type="url" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} placeholder="https://drive.google.com/your-cv" className="form-input" />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={saving}>
              {saving ? (
                <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
              ) : saved ? (
                <><CheckCircle size={18} /> Saved Successfully!</>
              ) : (
                <><Save size={18} /> Save to MongoDB</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
