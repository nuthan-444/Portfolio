import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2, CheckCheck, Circle, ExternalLink, Clock, Download } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/* ─── Inline styles ─────────────────────────────────────── */
const AdminStyles = () => (
  <style>{`
    .wr-page { padding: 110px 0 80px; }
    .wr-header { margin-bottom: 40px; }
    .wr-header h2 { font-size: clamp(1.6rem,3vw,2.4rem); margin-bottom: 6px; }
    .wr-header p  { color: var(--text-secondary); font-size: 0.95rem; }

    .wr-badge {
      display: inline-flex; align-items: center; justify-content: center;
      background: #ef4444; color: #fff;
      font-size: 0.7rem; font-weight: 700;
      width: 20px; height: 20px; border-radius: 50%;
      margin-left: 8px; vertical-align: middle;
    }

    .wr-empty { text-align: center; padding: 80px 0; color: var(--text-muted); }

    /* Request card */
    .wr-card {
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      margin-bottom: 14px;
      transition: border-color 0.2s ease;
      position: relative;
    }
    .wr-card.unread { border-left: 3px solid var(--text-primary); }
    .wr-card-header {
      display: flex; align-items: center; gap: 14px;
      padding: 18px 20px; cursor: pointer;
      transition: background 0.2s ease;
    }
    .wr-card-header:hover { background: var(--bg-secondary); }
    .wr-card-meta { flex: 1; min-width: 0; }
    .wr-card-name { font-weight: 700; font-family: var(--font-heading); font-size: 1rem; }
    .wr-card-sub  { color: var(--text-secondary); font-size: 0.82rem; margin-top: 2px;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .wr-card-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .wr-tag {
      padding: 3px 9px;
      font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
      border: 1px solid var(--border-color); background: var(--badge-bg);
      color: var(--text-secondary);
    }
    .wr-time { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; }

    /* Expanded body */
    .wr-body { padding: 0 20px 24px; border-top: 1px solid var(--border-color); }
    .wr-body-inner { padding-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 18px 28px; }
    @media (max-width: 640px) { .wr-body-inner { grid-template-columns: 1fr; } }
    .wr-field label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
                      color: var(--text-muted); margin-bottom: 4px; display: block; }
    .wr-field p, .wr-field a { font-size: 0.9rem; color: var(--text-primary); line-height: 1.6; word-break: break-word; }
    .wr-field.full { grid-column: 1 / -1; }
    .wr-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .wr-chip { padding: 3px 9px; font-size: 0.78rem; background: var(--badge-bg);
               border: 1px solid var(--border-color); color: var(--text-secondary); }
    .wr-action-bar { margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px solid var(--border-color); padding-top: 16px; }

    .wr-btn-icon {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
      border: 1px solid var(--border-color); background: var(--badge-bg); color: var(--text-secondary);
      transition: all 0.2s ease;
    }
    .wr-btn-icon:hover { border-color: var(--text-secondary); color: var(--text-primary); }
    .wr-btn-danger { border-color: rgba(239,68,68,0.4); color: #ef4444; background: rgba(239,68,68,0.06); }
    .wr-btn-danger:hover { border-color: #ef4444; background: rgba(239,68,68,0.12); }

    /* Toolbar */
    .wr-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
    .wr-filter-btn {
      padding: 6px 14px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
      border: 1px solid var(--border-color); background: transparent; color: var(--text-secondary);
      transition: all 0.2s ease;
    }
    .wr-filter-btn.active { background: var(--accent-color); color: var(--accent-inverse); border-color: var(--accent-color); }
  `}</style>
);

/* ─── Helpers ─────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ─── Single request card ────────────────────────────────── */
const RequestCard = ({ req, onToggleRead, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`wr-card ${!req.isRead ? 'unread' : ''}`}>
      {/* Header row */}
      <div className="wr-card-header" onClick={() => setOpen((o) => !o)}>
        <div style={{ color: req.isRead ? 'var(--text-muted)' : 'var(--text-primary)', flexShrink: 0 }}>
          {req.isRead ? <CheckCheck size={18} /> : <Circle size={18} />}
        </div>
        <div className="wr-card-meta">
          <div className="wr-card-name">{req.fullName}</div>
          <div className="wr-card-sub">{req.email}{req.company ? ` · ${req.company}` : ''} · {req.websiteType}</div>
        </div>
        <div className="wr-card-actions">
          <span className="wr-tag">{req.budget}</span>
          <span className="wr-time">
            <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {timeAgo(req.createdAt)}
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="wr-body">
              <div className="wr-body-inner">
                <div className="wr-field">
                  <label>Email</label>
                  <a href={`mailto:${req.email}`}>{req.email}</a>
                </div>
                {req.phone && (
                  <div className="wr-field">
                    <label>Phone / WhatsApp</label>
                    <p>{req.phone}</p>
                  </div>
                )}
                {req.company && (
                  <div className="wr-field">
                    <label>Company</label>
                    <p>{req.company}</p>
                  </div>
                )}
                <div className="wr-field">
                  <label>Website Type</label>
                  <p>{req.websiteType}</p>
                </div>
                <div className="wr-field">
                  <label>Budget</label>
                  <p>{req.budget}</p>
                </div>
                {req.timeline && (
                  <div className="wr-field">
                    <label>Timeline</label>
                    <p>{req.timeline}</p>
                  </div>
                )}
                <div className="wr-field">
                  <label>Contact Preference</label>
                  <p>{req.contactMethod}</p>
                </div>

                <div className="wr-field full">
                  <label>Project Description</label>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{req.projectDescription}</p>
                </div>

                {req.features?.length > 0 && (
                  <div className="wr-field full">
                    <label>Required Features</label>
                    <div className="wr-chips">
                      {req.features.map((f) => <span key={f} className="wr-chip">{f}</span>)}
                    </div>
                  </div>
                )}

                {req.existingWebsiteUrl && (
                  <div className="wr-field">
                    <label>Existing Website</label>
                    <a href={req.existingWebsiteUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {req.existingWebsiteUrl} <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                {req.referenceUrl && (
                  <div className="wr-field">
                    <label>Reference Website</label>
                    <a href={req.referenceUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {req.referenceUrl} <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                {req.uploadedFiles?.length > 0 && (
                  <div className="wr-field full">
                    <label>Uploaded Files</label>
                    <div className="wr-chips" style={{ marginTop: 6 }}>
                      {req.uploadedFiles.map((file, i) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={file.originalName}
                          className="wr-chip"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', textDecoration: 'none' }}
                        >
                          <Download size={12} />
                          {file.originalName}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {req.additionalInfo && (
                  <div className="wr-field full">
                    <label>Additional Info</label>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{req.additionalInfo}</p>
                  </div>
                )}
              </div>

              <div className="wr-action-bar">
                <button className="wr-btn-icon" onClick={() => onToggleRead(req._id)}>
                  <CheckCheck size={14} />
                  {req.isRead ? 'Mark Unread' : 'Mark Read'}
                </button>
                <button className="wr-btn-icon wr-btn-danger" onClick={() => onDelete(req._id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main admin page ────────────────────────────────────── */
const WebsiteRequests = () => {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | read

  const load = useCallback(async () => {
    try {
      const res = await api.get('/website-requests');
      setRequests(res.data.requests || []);
      setUnread(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load website requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!isAdmin) return <Navigate to="/" replace />;

  const handleToggleRead = async (id) => {
    try {
      const res = await api.put(`/website-requests/${id}/read`);
      setRequests((prev) => prev.map((r) => r._id === id ? res.data.request : r));
      setUnread(res.data.unreadCount);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      const res = await api.delete(`/website-requests/${id}`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setUnread(res.data.unreadCount);
    } catch (err) { console.error(err); }
  };

  const filtered = requests.filter((r) => {
    if (filter === 'unread') return !r.isRead;
    if (filter === 'read') return r.isRead;
    return true;
  });

  return (
    <>
      <AdminStyles />
      <section className="wr-page">
        <div className="container">
          <motion.div className="wr-header"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2>
              Website Requests
              {unread > 0 && <span className="wr-badge">{unread}</span>}
            </h2>
            <p>{requests.length} total request{requests.length !== 1 ? 's' : ''} · {unread} unread</p>
          </motion.div>

          {/* Toolbar */}
          <div className="wr-toolbar">
            {['all', 'unread', 'read'].map((f) => (
              <button key={f} className={`wr-filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading && (
            <div className="wr-empty">Loading requests…</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="wr-empty">No {filter !== 'all' ? filter + ' ' : ''}requests yet.</div>
          )}

          {!loading && filtered.map((req, i) => (
            <motion.div key={req._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}>
              <RequestCard req={req} onToggleRead={handleToggleRead} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default WebsiteRequests;
