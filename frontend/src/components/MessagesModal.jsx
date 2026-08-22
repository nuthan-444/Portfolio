import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle, Trash2, Clock, User, Reply } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MessagesModal = ({ isOpen, onClose }) => {
  const { setUnreadCount } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages');
      setMessages(res.data.messages || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  const handleToggleRead = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.put(`/messages/${id}/read`);
      setUnreadCount(res.data.unreadCount);
      fetchMessages();
    } catch (err) {
      console.error('Failed to update read state:', err);
    }
  };

  const handleDeleteMsg = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.delete(`/messages/${id}`);
      setUnreadCount(res.data.unreadCount);
      if (selectedMsg?._id === id) setSelectedMsg(null);
      fetchMessages();
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-content"
          style={{ maxWidth: '800px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={22} />
              <h3 style={{ fontSize: '1.4rem' }}>Admin Messages Inbox</h3>
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading inbox messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No messages received yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: selectedMsg ? '1fr 1fr' : '1fr', gap: '20px' }}>
              {/* Message List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    onClick={() => setSelectedMsg(msg)}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: msg._id === selectedMsg?._id ? 'var(--badge-bg)' : msg.isRead ? 'var(--card-bg)' : 'var(--bg-secondary)',
                      border: `1px solid ${msg._id === selectedMsg?._id ? 'var(--text-primary)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {!msg.isRead && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444',
                        }}
                      />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{msg.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{msg.email}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.message}
                    </p>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                      <button
                        onClick={(e) => handleToggleRead(msg._id, e)}
                        style={{ fontSize: '0.75rem', color: msg.isRead ? 'var(--text-muted)' : '#38bdf8', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <CheckCircle size={14} /> {msg.isRead ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={(e) => handleDeleteMsg(msg._id, e)}
                        style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Details Preview Pane */}
              {selectedMsg && (
                <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>Message Details</h4>
                    <button onClick={() => setSelectedMsg(null)} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Close Pane
                    </button>
                  </div>
                  <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                    <strong>Sender:</strong> {selectedMsg.name}
                  </p>
                  <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>
                    <strong>Email:</strong> <a href={`mailto:${selectedMsg.email}`} style={{ color: '#38bdf8' }}>{selectedMsg.email}</a>
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 16px 0' }}>
                    Received: {new Date(selectedMsg.createdAt).toLocaleString()}
                  </p>

                  <div style={{ background: 'var(--card-bg)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', minHeight: '160px', whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {selectedMsg.message}
                  </div>

                  <div style={{ marginTop: '16px', textAlign: 'right' }}>
                    <a
                      href={`mailto:${selectedMsg.email}?subject=Re:%20Portfolio%20Inquiry`}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      <Reply size={14} /> Reply via Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MessagesModal;
