import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Github, Linkedin, Twitter, Mail, Save, CheckCircle, Loader,
  Plus, Trash2, Link as LinkIcon, Cpu, Globe, Database, Sparkles,
  Workflow, Server, Terminal, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { SkeletonBox } from '../components/Skeleton';
import { getLinkIcon } from '../utils/linkIcons';

// Lucide icon map for domain icons dropdown
const DOMAIN_ICON_OPTIONS = [
  { value: 'Sparkles', label: 'AI / ML', Icon: Sparkles },
  { value: 'Globe', label: 'Web Dev', Icon: Globe },
  { value: 'Database', label: 'Database', Icon: Database },
  { value: 'Cpu', label: 'Systems', Icon: Cpu },
  { value: 'Terminal', label: 'Dev Tools', Icon: Terminal },
  { value: 'Server', label: 'DevOps', Icon: Server },
  { value: 'Workflow', label: 'Workflow', Icon: Workflow },
  { value: 'Linkedin', label: 'Professional', Icon: Linkedin },
];

// ─── Profile Skeleton ─────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <div style={{ paddingTop: 110, paddingBottom: 100, minHeight: '100vh' }}>
    <div className="container" style={{ maxWidth: 660 }}>
      <div style={{ marginBottom: 32 }}>
        <SkeletonBox height={12} width="8rem" style={{ marginBottom: 12 }} />
        <SkeletonBox height={36} width="60%" style={{ marginBottom: 12 }} />
        <SkeletonBox height={16} width="90%" />
      </div>
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 32 }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ marginBottom: 22 }}>
            <SkeletonBox height={13} width="30%" style={{ marginBottom: 8 }} />
            <SkeletonBox height={42} width="100%" style={{ borderRadius: 8 }} />
          </div>
        ))}
        <SkeletonBox height={48} width="100%" style={{ borderRadius: 8, marginTop: 8 }} />
      </div>
    </div>
  </div>
);

// ─── Small helper ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', marginBottom: 24, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1rem' }}>
          {Icon && <Icon size={18} />} {title}
        </span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div style={{ padding: '4px 24px 24px' }}>{children}</div>}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Profile = () => {
  const { token, user, loading: authLoading } = useAuth();

  // ── Config / social state ──────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    github: '', linkedin: '', twitter: '', email: '', resumeUrl: '', ownerName: '', tagline: '',
  });
  const [otherLinks, setOtherLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // ── Skills state ──────────────────────────────────────────────────────────
  const [domains, setDomains] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [skillsError, setSkillsError] = useState(null);

  // Fetch config
  useEffect(() => {
    if (!token || !user) return;
    api.get('/config').then((res) => {
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
      setOtherLinks(d.otherLinks || []);
    }).catch(() => setError('Failed to load config.')).finally(() => setLoading(false));
  }, [token, user]);

  // Fetch skills
  useEffect(() => {
    if (!token || !user) return;
    api.get('/skills').then((res) => {
      setDomains(res.data.map((d) => ({ ...d, _editing: false })));
    }).catch(() => setSkillsError('Failed to load skills.')).finally(() => setSkillsLoading(false));
  }, [token, user]);

  if (authLoading) return <ProfileSkeleton />;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (loading) return <ProfileSkeleton />;

  // ── Handlers: Social / Config ───────────────────────────────────────────────
  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addOtherLink = () => setOtherLinks((prev) => [...prev, { name: '', url: '', icon: 'Link' }]);
  const removeOtherLink = (idx) => setOtherLinks((prev) => prev.filter((_, i) => i !== idx));
  const updateOtherLink = (idx, field, val) =>
    setOtherLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: val } : l)));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.put('/config', {
        social: { github: formData.github, linkedin: formData.linkedin, twitter: formData.twitter, email: formData.email },
        otherLinks: otherLinks.filter((l) => l.name && l.url),
        resumeUrl: formData.resumeUrl,
        ownerName: formData.ownerName,
        tagline: formData.tagline,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Failed to save. Make sure you are logged in as admin.');
    } finally {
      setSaving(false);
    }
  };

  // ── Handlers: Skills ────────────────────────────────────────────────────────
  const addDomain = () => {
    setDomains((prev) => [
      ...prev,
      { _isNew: true, title: '', icon: 'Cpu', items: [], _newItem: '', _editing: true },
    ]);
  };

  const removeDomain = async (domain, idx) => {
    if (domain._isNew) { setDomains((prev) => prev.filter((_, i) => i !== idx)); return; }
    setSkillsSaving(true);
    try {
      await api.delete(`/skills/${domain._id}`);
      setDomains((prev) => prev.filter((_, i) => i !== idx));
    } catch { setSkillsError('Failed to delete domain.'); }
    finally { setSkillsSaving(false); }
  };

  const updateDomainField = (idx, field, val) =>
    setDomains((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: val } : d)));

  const addConceptToLocal = (idx) => {
    setDomains((prev) =>
      prev.map((d, i) => {
        if (i !== idx || !d._newItem?.trim()) return d;
        return { ...d, items: [...(d.items || []), d._newItem.trim()], _newItem: '' };
      })
    );
  };

  const removeConceptFromLocal = (domainIdx, conceptIdx) =>
    setDomains((prev) =>
      prev.map((d, i) =>
        i !== domainIdx ? d : { ...d, items: d.items.filter((_, ci) => ci !== conceptIdx) }
      )
    );

  const saveDomain = async (domain, idx) => {
    if (!domain.title.trim()) { setSkillsError('Domain title cannot be empty.'); return; }
    setSkillsSaving(true);
    setSkillsError(null);
    try {
      let saved;
      if (domain._isNew) {
        const res = await api.post('/skills', { title: domain.title, icon: domain.icon, items: domain.items, order: idx });
        saved = res.data;
      } else {
        const res = await api.put(`/skills/${domain._id}`, { title: domain.title, icon: domain.icon, items: domain.items, order: idx });
        saved = res.data;
      }
      setDomains((prev) => prev.map((d, i) => (i === idx ? { ...saved, _editing: false } : d)));
    } catch { setSkillsError('Failed to save domain.'); }
    finally { setSkillsSaving(false); }
  };

  return (
    <div style={{ paddingTop: 110, paddingBottom: 100, minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: 660 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              ADMIN ONLY
            </span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginTop: 8, marginBottom: 8 }}>Profile Settings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage social links, custom links, and your skills — all saved to MongoDB.
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: 20, fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* ── Section 1: Identity ────────────────────────────────────── */}
            <SectionCard title="Identity" icon={Cpu}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Nuthan Prasad KG" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Tagline / Role</label>
                <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Full-Stack Developer & AI/ML Engineer" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Resume / CV URL (optional)</label>
                <input type="url" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} placeholder="https://drive.google.com/your-cv" className="form-input" />
              </div>
            </SectionCard>

            {/* ── Section 2: Social Links ────────────────────────────────── */}
            <SectionCard title="Social Links" icon={Globe}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Github size={16} /> GitHub URL</label>
                <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/yourusername" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Linkedin size={16} /> LinkedIn URL</label>
                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/yourusername" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Twitter size={16} /> Twitter / X URL</label>
                <input type="url" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/yourusername" className="form-input" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={16} /> Contact Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="form-input" />
              </div>
            </SectionCard>

            {/* ── Section 3: Other Links (custom) ───────────────────────── */}
            <SectionCard title="Other Links" icon={LinkIcon}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Add any other profile or platform links (LeetCode, Devfolio, Kaggle, etc.)
              </p>
              {otherLinks.map((link, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 2fr auto', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                  {/* Live icon preview */}
                  <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', flexShrink: 0 }}>
                    {getLinkIcon(link, 16)}
                  </div>
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => updateOtherLink(idx, 'name', e.target.value)}
                    placeholder="Label (e.g. LeetCode)"
                    className="form-input"
                    style={{ margin: 0 }}
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateOtherLink(idx, 'url', e.target.value)}
                    placeholder="https://..."
                    className="form-input"
                    style={{ margin: 0 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeOtherLink(idx)}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 'var(--radius-sm)', padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOtherLink}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--badge-bg)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.875rem' }}
              >
                <Plus size={15} /> Add Custom Link
              </button>
            </SectionCard>

            {/* ── Save Button (config) ───────────────────────────────────── */}
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', marginBottom: 40 }} disabled={saving}>
              {saving ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                : saved ? <><CheckCircle size={18} /> Saved Successfully!</>
                : <><Save size={18} /> Save Profile & Links</>}
            </button>
          </form>

          {/* ═══ Skills / Domains Management ══════════════════════════════════ */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.3rem' }}>Skills & Domains</h2>
              <button
                type="button"
                onClick={addDomain}
                className="btn-primary"
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}
              >
                <Plus size={15} /> New Domain
              </button>
            </div>

            {skillsError && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', marginBottom: 16, fontSize: '0.85rem' }}>
                {skillsError}
              </div>
            )}

            {skillsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                    <SkeletonBox height={20} width="40%" style={{ marginBottom: 12 }} />
                    <SkeletonBox height={14} width="70%" style={{ marginBottom: 8 }} />
                    <SkeletonBox height={14} width="55%" />
                  </div>
                ))}
              </div>
            ) : (
              domains.map((domain, dIdx) => (
                <div key={domain._id || `new-${dIdx}`} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16 }}>
                  {/* Domain header row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10, alignItems: 'center', marginBottom: domain._editing ? 16 : 8 }}>
                    {domain._editing ? (
                      <>
                        <input
                          type="text"
                          value={domain.title}
                          onChange={(e) => updateDomainField(dIdx, 'title', e.target.value)}
                          placeholder="Domain title (e.g. App Development)"
                          className="form-input"
                          style={{ margin: 0 }}
                        />
                        <select
                          value={domain.icon}
                          onChange={(e) => updateDomainField(dIdx, 'icon', e.target.value)}
                          className="form-input"
                          style={{ margin: 0 }}
                        >
                          {DOMAIN_ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </>
                    ) : (
                      <div style={{ gridColumn: '1 / 3', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span>{domain.title}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--badge-bg)', borderRadius: 999 }}>{domain.icon}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => domain._editing ? saveDomain(domain, dIdx) : updateDomainField(dIdx, '_editing', true)}
                        disabled={skillsSaving}
                        style={{ padding: '7px 12px', background: domain._editing ? 'var(--text-primary)' : 'var(--badge-bg)', color: domain._editing ? 'var(--bg-primary)' : 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        {domain._editing ? (skillsSaving ? 'Saving…' : 'Save') : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDomain(domain, dIdx)}
                        style={{ padding: '7px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Concept chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: domain._editing ? 12 : 0 }}>
                    {(domain.items || []).map((item, cIdx) => (
                      <span key={cIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: 999, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {item}
                        {domain._editing && (
                          <button
                            type="button"
                            onClick={() => removeConceptFromLocal(dIdx, cIdx)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1, padding: 0, display: 'flex' }}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add concept input (edit mode only) */}
                  {domain._editing && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <input
                        type="text"
                        value={domain._newItem || ''}
                        onChange={(e) => updateDomainField(dIdx, '_newItem', e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addConceptToLocal(dIdx); } }}
                        placeholder="Add concept (press Enter)"
                        className="form-input"
                        style={{ margin: 0, flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => addConceptToLocal(dIdx)}
                        style={{ padding: '8px 14px', background: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
