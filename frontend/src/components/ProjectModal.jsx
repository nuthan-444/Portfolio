import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, GripVertical, Calendar, Code2 } from 'lucide-react';

const MAX_IMAGES = 5;

const toDateInputValue = (value) => {
  if (!value) return new Date().toISOString().split('T')[0];
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
};

const ProjectModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Web Dev',
    projectDate: toDateInputValue(),
    isHardCoded: false,
    projectLink: '',
    githubLink: '',
    techStack: '',
    order: 0,
    imageUrl: '',
  });

  // Unified ordered list of images: { id, kind: 'existing' | 'file', url, publicId?, file? }
  const [imageItems, setImageItems] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        title: initialData.title || '',
        shortDescription: initialData.shortDescription || '',
        description: initialData.description || '',
        category: initialData.category || 'Web Dev',
        projectDate: toDateInputValue(initialData.projectDate || initialData.createdAt),
        isHardCoded: Boolean(initialData.isHardCoded),
        projectLink: initialData.projectLink || '',
        githubLink: initialData.githubLink || '',
        techStack: Array.isArray(initialData.techStack)
          ? initialData.techStack.join(', ')
          : initialData.techStack || '',
        order: initialData.order || 0,
        imageUrl: '',
      });
      setImageItems(
        (initialData.images || []).map((img, i) => ({
          id: `existing_${img.publicId || i}_${Date.now()}`,
          kind: 'existing',
          url: img.url,
          publicId: img.publicId || '',
        }))
      );
    } else {
      setFormData({
        title: '',
        shortDescription: '',
        description: '',
        category: 'Web Dev',
        projectDate: toDateInputValue(),
        isHardCoded: false,
        projectLink: '',
        githubLink: '',
        techStack: 'React, Node.js, MongoDB',
        order: 0,
        imageUrl: '',
      });
      setImageItems([]);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageItems((prev) => {
      const remainingSlots = Math.max(0, MAX_IMAGES - prev.length);
      const filesToAdd = files.slice(0, remainingSlots).map((file, idx) => ({
        id: `file_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
        kind: 'file',
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...filesToAdd];
    });

    // Reset input so user can pick additional files
    e.target.value = '';
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= imageItems.length || fromIndex === toIndex) return;
    setImageItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const removeImage = (index) => {
    setImageItems((prev) => {
      const target = prev[index];
      if (target?.kind === 'file' && target.url?.startsWith('blob:')) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    moveImage(dragIndex, index);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('shortDescription', formData.shortDescription);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('projectDate', formData.projectDate);
      data.append('isHardCoded', String(Boolean(formData.isHardCoded)));
      data.append('projectLink', formData.projectLink);
      data.append('githubLink', formData.githubLink);
      data.append('techStack', formData.techStack);
      data.append('order', formData.order);

      const newFiles = imageItems.filter((item) => item.kind === 'file');

      if (formData.imageUrl && imageItems.length === 0) {
        data.append('imageUrl', formData.imageUrl);
      }

      // Append files in the exact reordered sequence
      let fileIdx = 0;
      const imageOrder = imageItems.map((item) => {
        if (item.kind === 'existing') {
          return { kind: 'existing', url: item.url, publicId: item.publicId || '' };
        }
        data.append('images', item.file);
        return { kind: 'new', fileIndex: fileIdx++ };
      });

      if (initialData) {
        data.append('imageOrder', JSON.stringify(imageOrder));
      } else if (newFiles.length === 0 && formData.imageUrl) {
        data.set('imageUrl', formData.imageUrl);
      }

      await onSubmit(data, initialData?._id);
      onClose();
    } catch (err) {
      console.error('Failed to save project:', err);
    } finally {
      setSubmitting(false);
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
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.4rem' }}>{initialData ? 'Edit Project' : 'Add New Project'}</h3>
            <button type="button" onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Autonomous Agent Orchestrator"
                className="form-input"
              />
            </div>

            {/* Category + Project Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                  <option value="Web Dev">Web Dev</option>
                  <option value="AI/ML">AI/ML</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} /> Project Date *
                </label>
                <input
                  type="date"
                  name="projectDate"
                  required
                  value={formData.projectDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Hard-Coded (Built Without AI) Toggle */}
            <label
              htmlFor="isHardCoded"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                marginBottom: 20,
                border: formData.isHardCoded ? '1.5px solid var(--text-primary)' : '1px solid var(--border-color)',
                background: formData.isHardCoded ? 'var(--badge-bg)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                id="isHardCoded"
                type="checkbox"
                name="isHardCoded"
                checked={Boolean(formData.isHardCoded)}
                onChange={handleChange}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-color)', cursor: 'pointer', flexShrink: 0 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}>
                  <Code2 size={15} />
                  Hard-Coded Project (Built Without AI)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Highlights this card with an architectural frame &amp; &quot;Hard-Coded • Built Without AI&quot; header strip.
                </span>
              </div>
            </label>

            <details style={{ marginBottom: 20 }}>
              <summary style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-muted)', marginBottom: 8 }}>
                Advanced Options
              </summary>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">
                  Manual Order <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional numeric metadata)</span>
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0"
                />
              </div>
            </details>

            {/* Unified Image Upload + Drag/Button Reorder */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Project Images ({imageItems.length}/{MAX_IMAGES})
                </label>
                {imageItems.length > 1 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Drag or use arrows to reorder • #1 is cover
                  </span>
                )}
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                disabled={imageItems.length >= MAX_IMAGES}
                onChange={handleFileChange}
                className="form-input"
                style={{ padding: '10px' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Select up to {MAX_IMAGES} images. They are uploaded to Cloudinary in the order shown below.
              </p>

              {imageItems.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                  {imageItems.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{
                        position: 'relative',
                        width: 104,
                        borderRadius: 10,
                        border: dragIndex === index ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        padding: 6,
                        cursor: 'grab',
                        opacity: dragIndex === index ? 0.65 : 1,
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      {/* Top badge + delete */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 9999,
                            background: index === 0 ? 'var(--accent-color)' : 'var(--badge-bg)',
                            color: index === 0 ? 'var(--accent-inverse)' : 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <GripVertical size={10} />
                          {index === 0 ? 'Cover' : `#${index + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          title="Remove image"
                          style={{
                            background: '#ef4444',
                            color: '#fff',
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: 'none',
                          }}
                        >
                          ×
                        </button>
                      </div>

                      <img
                        src={item.url}
                        alt={`preview-${index + 1}`}
                        style={{
                          width: '100%',
                          height: 62,
                          objectFit: 'cover',
                          borderRadius: 6,
                          display: 'block',
                        }}
                      />

                      {/* Reorder Arrows */}
                      {imageItems.length > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, gap: 4 }}>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveImage(index, index - 1)}
                            title="Move left"
                            style={{
                              flex: 1,
                              padding: '2px 0',
                              borderRadius: 4,
                              border: '1px solid var(--border-color)',
                              background: 'var(--card-bg)',
                              color: index === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                              opacity: index === 0 ? 0.35 : 1,
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ArrowLeft size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={index === imageItems.length - 1}
                            onClick={() => moveImage(index, index + 1)}
                            title="Move right"
                            style={{
                              flex: 1,
                              padding: '2px 0',
                              borderRadius: 4,
                              border: '1px solid var(--border-color)',
                              background: 'var(--card-bg)',
                              color: index === imageItems.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                              opacity: index === imageItems.length - 1 ? 0.35 : 1,
                              cursor: index === imageItems.length - 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {imageItems.length === 0 && (
                <>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    Or provide an image URL fallback:
                  </p>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="form-input"
                    style={{ marginTop: 6 }}
                  />
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Short Description (Card preview) *</label>
              <textarea
                name="shortDescription"
                required
                rows={2}
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Brief 2-3 line summary"
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Description *</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed technical architecture breakdown"
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tech Stack (comma separated)</label>
              <input
                type="text"
                name="techStack"
                value={formData.techStack}
                onChange={handleChange}
                placeholder="React, Express, MongoDB, PyTorch, LangChain"
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Live Project URL</label>
                <input
                  type="url"
                  name="projectLink"
                  value={formData.projectLink}
                  onChange={handleChange}
                  placeholder="https://myproject.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub Repository URL</label>
                <input
                  type="url"
                  name="githubLink"
                  value={formData.githubLink}
                  onChange={handleChange}
                  placeholder="https://github.com/user/repo"
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving...' : initialData ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectModal;
