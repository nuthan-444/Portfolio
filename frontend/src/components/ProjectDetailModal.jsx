import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';
import { getOptimizedImageUrl, preloadImage } from '../utils/imageOptimizer';

const ProjectDetailModal = ({ project, onClose }) => {
  const [currentImg, setCurrentImg] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!project) return null;

  const images = project.images?.length > 0
    ? project.images
    : [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' }];

  // Preload neighboring images in modal carousel
  useEffect(() => {
    if (images.length <= 1) return;
    const nextIndex = (currentImg + 1) % images.length;
    const prevIndex = (currentImg - 1 + images.length) % images.length;
    if (images[nextIndex]?.url) preloadImage(getOptimizedImageUrl(images[nextIndex].url, { width: 1200 }));
    if (images[prevIndex]?.url) preloadImage(getOptimizedImageUrl(images[prevIndex].url, { width: 1200 }));
  }, [currentImg, images]);

  const prevImg = () => setCurrentImg((p) => (p - 1 + images.length) % images.length);
  const nextImg = () => setCurrentImg((p) => (p + 1) % images.length);

  const formattedDate = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: 820,
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)',
            scrollbarWidth: 'thin',
          }}
        >
          {/* Image Carousel */}
          <div style={{ position: 'relative', height: 360, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', overflow: 'hidden', flexShrink: 0 }}>
            <img
              src={getOptimizedImageUrl(images[currentImg]?.url, { width: 1200 })}
              alt={project.title}
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Carousel Nav */}
            {images.length > 1 && (
              <>
                <button onClick={prevImg} style={navBtnStyle('left')}>
                  <ChevronLeft size={22} />
                </button>
                <button onClick={nextImg} style={navBtnStyle('right')}>
                  <ChevronRight size={22} />
                </button>
                <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                  {images.map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setCurrentImg(i)}
                      style={{
                        width: i === currentImg ? 20 : 7,
                        height: 7,
                        borderRadius: 9999,
                        background: i === currentImg ? '#fff' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div style={{ position: 'absolute', bottom: 40, right: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={getOptimizedImageUrl(img.url, { width: 150 })}
                    alt={`thumb-${i}`}
                    decoding="async"
                    onClick={() => setCurrentImg(i)}
                    style={{
                      width: 44, height: 36, objectFit: 'cover', borderRadius: 6,
                      border: i === currentImg ? '2px solid #fff' : '2px solid transparent',
                      cursor: 'pointer', opacity: i === currentImg ? 1 : 0.6,
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'rgba(0,0,0,0.6)', color: '#fff',
                border: 'none', borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', backdropFilter: 'blur(4px)',
              }}
            >
              <X size={18} />
            </button>

            {/* Category Badge */}
            <span style={{
              position: 'absolute', top: 14, left: 14,
              background: 'rgba(0,0,0,0.65)', color: '#fff',
              borderRadius: 9999, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', backdropFilter: 'blur(4px)',
            }}>
              {project.category}
            </span>
          </div>

          {/* Content */}
          <div style={{ padding: '28px 32px 36px' }}>

            {/* Title + Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, flex: 1 }}>
                {project.title}
              </h2>
              {formattedDate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  <Calendar size={13} /> {formattedDate}
                </span>
              )}
            </div>

            {/* Short Description */}
            {project.shortDescription && (
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 20, lineHeight: 1.6 }}>
                {project.shortDescription}
              </p>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border-color)', marginBottom: 20 }} />

            {/* Full Description */}
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>About this Project</h4>
            <p style={{ fontSize: '0.97rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 28, whiteSpace: 'pre-wrap' }}>
              {project.description}
            </p>

            {/* Tech Stack */}
            {project.techStack?.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag size={13} /> Tech Stack
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.techStack.map((tech) => (
                    <span key={tech} className="tech-tag" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Links */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {project.projectLink && (
                <a
                  href={project.projectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ fontSize: '0.9rem', padding: '12px 24px' }}
                >
                  <ExternalLink size={16} /> Live Project
                </a>
              )}
              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: '0.9rem', padding: '12px 24px' }}
                >
                  <Github size={16} /> View on GitHub
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const navBtnStyle = (side) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  [side]: 14,
  background: 'rgba(0,0,0,0.55)',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: 38,
  height: 38,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backdropFilter: 'blur(4px)',
  zIndex: 10,
});

export default ProjectDetailModal;
