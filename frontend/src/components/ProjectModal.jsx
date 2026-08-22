import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'Web Dev',
    projectLink: '',
    githubLink: '',
    techStack: '',
    order: 0,
    imageUrl: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        shortDescription: initialData.shortDescription || '',
        description: initialData.description || '',
        category: initialData.category || 'Web Dev',
        projectLink: initialData.projectLink || '',
        githubLink: initialData.githubLink || '',
        techStack: Array.isArray(initialData.techStack) ? initialData.techStack.join(', ') : initialData.techStack || '',
        order: initialData.order || 0,
        imageUrl: initialData.images?.[0]?.url || '',
      });
      if (initialData.images && initialData.images.length > 0) {
        setPreviewUrls(initialData.images.map((img) => img.url));
      }
    } else {
      setFormData({
        title: '',
        shortDescription: '',
        description: '',
        category: 'Web Dev',
        projectLink: '',
        githubLink: '',
        techStack: 'React, Node.js, MongoDB',
        order: 0,
        imageUrl: '',
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
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
      data.append('projectLink', formData.projectLink);
      data.append('githubLink', formData.githubLink);
      data.append('techStack', formData.techStack);
      data.append('order', formData.order);

      if (formData.imageUrl && selectedFiles.length === 0) {
        data.append('imageUrl', formData.imageUrl);
      }

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          data.append('images', file);
        });
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
            <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
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

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                <option value="Web Dev">Web Dev</option>
                <option value="AI/ML">AI/ML</option>
              </select>
            </div>


            <details style={{ marginBottom: 20 }}>
              <summary style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-muted)', marginBottom: 8 }}>
                Advanced Options
              </summary>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">
                  Sort Order <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(lower number = shown first; leave 0 for auto newest-first)</span>
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

            {/* Image File Upload (multi-file, no URL fallback) */}
            <div className="form-group">
              <label className="form-label">Upload Project Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
                style={{ padding: '10px' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Select one or more image files. They will be uploaded to Cloudinary.
              </p>

              {/* Image Previews with remove button */}
              {previewUrls.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                  {previewUrls.map((url, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`preview-${index}`}
                        style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
                          setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                        }}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
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
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
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

            {/* Image File Upload & Preview */}
            <div className="form-group">
              <label className="form-label">Upload Images (Cloudinary Multi-file)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
                style={{ padding: '8px' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Or provide an image URL fallback below:
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

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
                  {previewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt="preview"
                      style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }}
                    />
                  ))}
                </div>
              )}
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
