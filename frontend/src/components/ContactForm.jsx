import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ContactForm = () => {
  const { fetchUnreadCount } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await api.post('/messages', formData);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
      });

      setStatus({
        type: 'success',
        message: res.data.message || 'Thanks! Your message is on its way 📬',
      });

      setFormData({ name: '', email: '', message: '' });

      // Refresh admin unread count if logged in
      fetchUnreadCount();
    } catch (err) {
      console.error('Contact form submission error:', err);
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container" style={{ maxWidth: '750px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h2 className="section-title">Let's Work Together</h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Have a project in mind, an AI/ML idea, or want to collaborate? Send me a message below!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {status && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: status.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${status.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: status.type === 'success' ? '#22c55e' : '#ef4444',
                fontSize: '0.95rem',
              }}
            >
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Steve Rogers"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="steve@avengers.io"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Message *</label>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell me about your project, timeline, or idea..."
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '12px', padding: '14px' }}
            >
              {loading ? (
                'Sending Message...'
              ) : (
                <>
                  Send Message <Send size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
