import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Upload, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

/* ─── Constants ─────────────────────────────────────────── */
const WEBSITE_TYPES = [
  'Business Website', 'Portfolio', 'E-commerce', 'Blog',
  'Landing Page', 'Web Application', 'College / Student Project', 'Other',
];

const FEATURES = [
  'User Login / Signup', 'Admin Dashboard', 'Payment Integration',
  'Database', 'Contact Form', 'Booking System',
  'E-commerce / Shopping Cart', 'Search', 'Notifications',
  'API Integration', 'Other',
];

const BUDGETS = [
  'Under ₹5,000', '₹5,000 – ₹10,000', '₹10,000 – ₹25,000',
  '₹25,000 – ₹50,000', '₹50,000+', 'Not Sure',
];

const TIMELINES = [
  'ASAP', 'Within 1 Week', '2–4 Weeks', '1–2 Months', 'Flexible',
];

const CONTACT_METHODS = ['Email', 'WhatsApp', 'Phone Call'];

/* ─── Inline styles scoped to this page ─────────────────── */
const PageStyles = () => (
  <style>{`
    .req-page { padding: 100px 0 80px; }
    .req-hero { text-align: center; margin-bottom: 64px; }
    .req-hero h1 { font-size: clamp(2rem,4.5vw,3.4rem); margin-bottom: 20px; }
    .req-hero p  { font-size: 1.1rem; color: var(--text-secondary); max-width: 580px; margin: 0 auto; line-height: 1.8; }

    .req-form-wrap { max-width: 740px; margin: 0 auto; display: flex; flex-direction: column; gap: 36px; }

    /* Section card — mirrors existing glass style */
    .req-section {
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      background: rgba(255,255,255,0.50);
      border: 1px solid rgba(255,255,255,0.75);
      box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset;
      padding: 32px;
    }
    [data-theme='dark'] .req-section {
      background: rgba(24,24,27,0.50);
      border: 1px solid rgba(255,255,255,0.09);
      box-shadow: 0 4px 24px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset;
    }
    .req-section::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: var(--text-primary);
      opacity: 0.15;
    }
    .req-section-title {
      font-size: 1.15rem;
      font-family: var(--font-heading);
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .req-section-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px; height: 26px;
      background: var(--accent-color);
      color: var(--accent-inverse);
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    /* Grid helper */
    .req-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    @media (max-width: 600px) { .req-grid-2 { grid-template-columns: 1fr; } }

    /* Feature toggle chips */
    .req-features-grid {
      display: flex; flex-wrap: wrap; gap: 10px;
    }
    .req-feature-chip {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 7px 14px;
      border: 1px solid var(--border-color);
      background: var(--badge-bg);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }
    .req-feature-chip.active {
      border-color: var(--text-primary);
      background: var(--accent-color);
      color: var(--accent-inverse);
    }
    .req-feature-chip:hover:not(.active) {
      border-color: var(--text-secondary);
      color: var(--text-primary);
    }

    /* Radio-style pill group */
    .req-pill-group { display: flex; flex-wrap: wrap; gap: 10px; }
    .req-pill {
      padding: 7px 16px;
      border: 1px solid var(--border-color);
      background: var(--badge-bg);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }
    .req-pill.active {
      border-color: var(--text-primary);
      background: var(--accent-color);
      color: var(--accent-inverse);
    }
    .req-pill:hover:not(.active) { border-color: var(--text-secondary); color: var(--text-primary); }

    /* File upload zone */
    .req-file-zone {
      border: 1.5px dashed var(--border-color);
      padding: 28px 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.25s ease, background 0.25s ease;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .req-file-zone:hover { border-color: var(--text-secondary); background: var(--bg-secondary); }
    .req-file-tag {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px;
      background: var(--badge-bg);
      border: 1px solid var(--border-color);
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin: 4px;
    }

    /* Validation error */
    .req-field-error { color: #ef4444; font-size: 0.78rem; margin-top: 4px; }

    /* Success card */
    .req-success {
      text-align: center;
      padding: 80px 40px;
      max-width: 520px;
      margin: 0 auto;
    }
    .req-success-icon-wrap {
      width: 72px; height: 72px;
      display: flex; align-items: center; justify-content: center;
      background: var(--accent-color);
      color: var(--accent-inverse);
      margin: 0 auto 28px;
    }
    .req-success h2 { font-size: 1.8rem; margin-bottom: 14px; }
    .req-success p  { color: var(--text-secondary); line-height: 1.8; margin-bottom: 32px; }
  `}</style>
);

/* ─── Form label ─────────────────────────────────────────── */
const Label = ({ children, required }) => (
  <label className="form-label">
    {children}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
  </label>
);

/* ─── Main component ─────────────────────────────────────── */
const RequestWebsite = () => {
  const fileInputRef = useRef(null);

  const defaultForm = {
    fullName: '', email: '', phone: '', company: '',
    websiteType: '', projectDescription: '', features: [],
    hasExistingWebsite: null, existingWebsiteUrl: '', referenceUrl: '',
    budget: '', timeline: '',
    additionalInfo: '', contactMethod: 'Email',
  };

  const [form, setForm] = useState(defaultForm);
  const [files, setFiles] = useState([]); // actual File objects
  const [fileError, setFileError] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');

  /* ── Field change helpers ── */
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleFeature = (feat) => {
    setForm((f) => ({
      ...f,
      features: f.features.includes(feat)
        ? f.features.filter((x) => x !== feat)
        : [...f.features, feat],
    }));
  };

  /* ── File pick ── */
  const ALLOWED_TYPES = ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml','application/pdf'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleFiles = (incoming) => {
    setFileError('');
    const arr = Array.from(incoming);
    const invalid = arr.filter((f) => !ALLOWED_TYPES.includes(f.type));
    const tooBig  = arr.filter((f) => f.size > MAX_SIZE);
    if (invalid.length) { setFileError('Only images (JPG, PNG, GIF, WebP, SVG) and PDFs are allowed.'); return; }
    if (tooBig.length)  { setFileError('Each file must be smaller than 10 MB.'); return; }
    setFiles((prev) => [...prev, ...arr]);
  };
  const removeFile = (name) => setFiles((prev) => prev.filter((f) => f.name !== name));

  /* ── Validate ── */
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address.';
    }
    if (!form.websiteType) e.websiteType = 'Please select a website type.';
    if (!form.projectDescription.trim()) e.projectDescription = 'Project description is required.';
    if (form.features.length === 0) e.features = 'Select at least one feature.';
    if (!form.budget) e.budget = 'Please select a budget range.';
    if (form.hasExistingWebsite && form.existingWebsiteUrl) {
      try { new URL(form.existingWebsiteUrl); } catch { e.existingWebsiteUrl = 'Enter a valid URL.'; }
    }
    if (form.referenceUrl) {
      try { new URL(form.referenceUrl); } catch { e.referenceUrl = 'Enter a valid URL.'; }
    }
    return e;
  };

  /* ── Submit as multipart/form-data ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus('loading');
    setServerError('');
    try {
      const fd = new FormData();
      // Scalar fields
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
        else if (v !== null && v !== undefined) fd.append(k, v);
      });
      // Actual file objects
      files.forEach((f) => fd.append('files', f));

      await api.post('/website-requests', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus('success');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  /* ── Success screen ── */
  if (status === 'success') {
    return (
      <>
        <PageStyles />
        <section className="req-page section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="req-success"
            >
              <div className="req-success-icon-wrap">
                <CheckCircle2 size={36} />
              </div>
              <h2>Request Sent Successfully!</h2>
              <p>
                Thanks for sharing your project idea. I'll review the details and
                get back to you soon with the next steps.
              </p>
              <Link to="/" className="btn-primary">
                Back to Home <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  const animSection = (i) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, delay: i * 0.08 },
  });

  return (
    <>
      <PageStyles />
      <section className="req-page">
        <div className="container">

          {/* ── Hero ── */}
          <motion.div
            className="req-hero"
            initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1>Have a Website Idea?<br />Let's Build It.</h1>
            <p>
              Tell me about your project, requirements, and vision. I'll review your
              request and get back to you with the next steps.
            </p>
          </motion.div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="req-form-wrap">

              {/* ── 1. Personal Info ── */}
              <motion.div className="req-section" {...animSection(0)}>
                <div className="req-section-title">
                  <span className="req-section-num">1</span> Personal Information
                </div>
                <div className="req-grid-2">
                  <div className="form-group">
                    <Label required>Full Name</Label>
                    <input className="form-input" value={form.fullName}
                      onChange={(e) => set('fullName', e.target.value)}
                      placeholder="John Doe" />
                    {errors.fullName && <p className="req-field-error">{errors.fullName}</p>}
                  </div>
                  <div className="form-group">
                    <Label required>Email Address</Label>
                    <input className="form-input" type="email" value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="john@example.com" />
                    {errors.email && <p className="req-field-error">{errors.email}</p>}
                  </div>
                  <div className="form-group">
                    <Label>WhatsApp / Phone</Label>
                    <input className="form-input" value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+91 98765 43210" />
                  </div>
                  <div className="form-group">
                    <Label>Company / Business Name</Label>
                    <input className="form-input" value={form.company}
                      onChange={(e) => set('company', e.target.value)}
                      placeholder="Acme Inc." />
                  </div>
                </div>
              </motion.div>

              {/* ── 2. Website Requirements ── */}
              <motion.div className="req-section" {...animSection(1)}>
                <div className="req-section-title">
                  <span className="req-section-num">2</span> Website Requirements
                </div>

                <div className="form-group">
                  <Label required>Website Type</Label>
                  <select className="form-select" value={form.websiteType}
                    onChange={(e) => set('websiteType', e.target.value)}>
                    <option value="">Select type…</option>
                    {WEBSITE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  {errors.websiteType && <p className="req-field-error">{errors.websiteType}</p>}
                </div>

                <div className="form-group">
                  <Label required>Project Description</Label>
                  <textarea className="form-textarea" rows={5} value={form.projectDescription}
                    onChange={(e) => set('projectDescription', e.target.value)}
                    placeholder="Tell me about your website idea, what you want it to do, and what you're looking for."
                    style={{ resize: 'vertical' }} />
                  {errors.projectDescription && <p className="req-field-error">{errors.projectDescription}</p>}
                </div>

                <div className="form-group">
                  <Label required>Required Features</Label>
                  <div className="req-features-grid" style={{ marginTop: 10 }}>
                    {FEATURES.map((feat) => (
                      <button
                        type="button"
                        key={feat}
                        className={`req-feature-chip ${form.features.includes(feat) ? 'active' : ''}`}
                        onClick={() => toggleFeature(feat)}
                      >
                        {form.features.includes(feat) && <CheckCircle2 size={13} />}
                        {feat}
                      </button>
                    ))}
                  </div>
                  {errors.features && <p className="req-field-error">{errors.features}</p>}
                </div>
              </motion.div>

              {/* ── 3. Design & References ── */}
              <motion.div className="req-section" {...animSection(2)}>
                <div className="req-section-title">
                  <span className="req-section-num">3</span> Design &amp; References
                </div>

                <div className="form-group">
                  <Label>Do you have an existing website?</Label>
                  <div className="req-pill-group" style={{ marginTop: 10 }}>
                    {['Yes', 'No'].map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        className={`req-pill ${form.hasExistingWebsite === (opt === 'Yes') ? 'active' : ''}`}
                        onClick={() => set('hasExistingWebsite', opt === 'Yes')}
                      >{opt}</button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {form.hasExistingWebsite === true && (
                    <motion.div
                      key="existing-url"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="form-group"
                    >
                      <Label>Existing Website URL</Label>
                      <input className="form-input" value={form.existingWebsiteUrl}
                        onChange={(e) => set('existingWebsiteUrl', e.target.value)}
                        placeholder="https://yoursite.com" />
                      {errors.existingWebsiteUrl && <p className="req-field-error">{errors.existingWebsiteUrl}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="form-group">
                  <Label>Reference Website URL <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></Label>
                  <input className="form-input" value={form.referenceUrl}
                    onChange={(e) => set('referenceUrl', e.target.value)}
                    placeholder="A site whose design / functionality you like" />
                  {errors.referenceUrl && <p className="req-field-error">{errors.referenceUrl}</p>}
                </div>

                <div className="form-group">
                  <Label>Upload Design / Files <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></Label>
                  <div
                    className="req-file-zone"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <Upload size={20} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                    Click or drag — images (JPG, PNG, GIF, WebP, SVG) or PDF · max 10 MB each
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  {fileError && <p className="req-field-error">{fileError}</p>}
                  {files.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap' }}>
                      {files.map((f) => (
                        <span key={f.name} className="req-file-tag">
                          {f.name}
                          <button type="button" onClick={() => removeFile(f.name)} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ── 4. Budget & Timeline ── */}
              <motion.div className="req-section" {...animSection(3)}>
                <div className="req-section-title">
                  <span className="req-section-num">4</span> Budget &amp; Timeline
                </div>

                <div className="form-group">
                  <Label required>Estimated Budget</Label>
                  <div className="req-pill-group" style={{ marginTop: 10 }}>
                    {BUDGETS.map((b) => (
                      <button type="button" key={b}
                        className={`req-pill ${form.budget === b ? 'active' : ''}`}
                        onClick={() => set('budget', b)}>{b}</button>
                    ))}
                  </div>
                  {errors.budget && <p className="req-field-error">{errors.budget}</p>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <Label>When do you need it?</Label>
                  <div className="req-pill-group" style={{ marginTop: 10 }}>
                    {TIMELINES.map((t) => (
                      <button type="button" key={t}
                        className={`req-pill ${form.timeline === t ? 'active' : ''}`}
                        onClick={() => set('timeline', t)}>{t}</button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── 5. Additional Info ── */}
              <motion.div className="req-section" {...animSection(4)}>
                <div className="req-section-title">
                  <span className="req-section-num">5</span> Additional Information
                </div>

                <div className="form-group">
                  <Label>Anything else I should know? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></Label>
                  <textarea className="form-textarea" rows={4} value={form.additionalInfo}
                    onChange={(e) => set('additionalInfo', e.target.value)}
                    placeholder="Any other details, constraints, or context…"
                    style={{ resize: 'vertical' }} />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <Label>Preferred Contact Method</Label>
                  <div className="req-pill-group" style={{ marginTop: 10 }}>
                    {CONTACT_METHODS.map((m) => (
                      <button type="button" key={m}
                        className={`req-pill ${form.contactMethod === m ? 'active' : ''}`}
                        onClick={() => set('contactMethod', m)}>{m}</button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── Error banner ── */}
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: '14px 20px',
                    border: '1px solid rgba(239,68,68,0.4)',
                    background: 'rgba(239,68,68,0.08)',
                    color: '#ef4444',
                    fontSize: '0.9rem',
                  }}
                >
                  {serverError}
                </motion.div>
              )}

              {/* ── Submit ── */}
              <motion.div {...animSection(5)} style={{ textAlign: 'center', paddingBottom: 40 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={status === 'loading'}
                  style={{ fontSize: '1rem', padding: '14px 36px', gap: 10 }}
                >
                  {status === 'loading' ? (
                    <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</>
                  ) : (
                    <>Send Project Request <ArrowRight size={18} /></>
                  )}
                </button>
              </motion.div>

            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default RequestWebsite;
