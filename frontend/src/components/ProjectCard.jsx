import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, Edit2, Trash2, Eye, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOptimizedImageUrl, preloadImage } from '../utils/imageOptimizer';

const ProjectCard = ({ project, onEdit, onDelete, onClickDetail }) => {
  const { isAdmin } = useAuth();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const images = project.images && project.images.length > 0
    ? project.images
    : [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80' }];

  // Preload full modal image on mouse enter
  const handleMouseEnter = () => {
    images.forEach((img) => {
      if (img?.url) {
        preloadImage(getOptimizedImageUrl(img.url, { width: 1200 }));
      }
    });
  };

  // Reset blur state when image changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentImgIndex]);

  // Auto-swipe image carousel every 5 seconds if multiple images
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`project-card ${project.isHardCoded ? 'project-card--hardcoded' : ''}`}
      onMouseEnter={handleMouseEnter}
    >
      {project.isHardCoded && (
        <div
          className="hardcoded-strip"
          title="100% hand-coded from scratch without AI code generation"
        >
          <span className="hardcoded-strip-left">
            <Code2 size={13} />
            <span>Hard-Coded</span>
          </span>
          <span className="hardcoded-strip-tag">Built Without AI</span>
        </div>
      )}

      {/* Admin Quick Action Controls */}
      {isAdmin && (
        <div
          style={{
            position: 'absolute',
            top: project.isHardCoded ? '42px' : '12px',
            right: '12px',
            zIndex: 30,
            display: 'flex',
            gap: '8px',
            background: 'rgba(0,0,0,0.75)',
            padding: '6px 10px',
            borderRadius: '8px',
            backdropFilter: 'blur(6px)',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(project); }}
            style={{ color: '#38bdf8' }}
            title="Edit Project"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project); }}
            style={{ color: '#f87171' }}
            title="Delete Project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Image Carousel with Blur Placeholder */}
      <div
        className="card-carousel"
        onClick={() => onClickDetail && onClickDetail()}
        style={{ cursor: onClickDetail ? 'pointer' : 'default' }}
      >
        {/* Blurred placeholder skeleton shown while loading */}
        {!imageLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--bg-secondary)',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--text-muted)',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        )}
        <img
          src={getOptimizedImageUrl(images[currentImgIndex]?.url || images[0].url, { width: 600 })}
          alt={project.title}
          className="carousel-img"
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          style={{
            filter: imageLoaded ? 'blur(0px)' : 'blur(12px)',
            transform: imageLoaded ? 'scale(1)' : 'scale(1.05)',
            transition: 'filter 0.4s ease, transform 0.4s ease',
            zIndex: 2,
            position: 'relative',
          }}
        />

        {images.length > 1 && (
          <div className="carousel-dots" style={{ zIndex: 10 }}>
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`dot ${idx === currentImgIndex ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(idx); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Body Content */}
      <div className="card-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{project.category}</span>
            {(project.projectDate || project.createdAt) && (
              <span>
                • {new Date(project.projectDate || project.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
              </span>
            )}
          </span>
          {isAdmin && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Eye size={12} /> {project.count || 0} views
            </span>
          )}
        </div>

        <h3
          className="card-title"
          onClick={() => onClickDetail && onClickDetail()}
          style={{ cursor: onClickDetail ? 'pointer' : 'default' }}
        >
          {project.title}
        </h3>
        <p className="card-description">{project.shortDescription || project.description?.slice(0, 110)}...</p>

        <div className="tech-tags">
          {project.techStack?.map((tech) => (
            <span key={tech} className="tech-tag">{tech}</span>
          ))}
        </div>

        <div className="card-actions">
          <div className="card-links">
            {project.projectLink && (
              <a href={project.projectLink} target="_blank" rel="noopener noreferrer" className="card-link-btn">
                Live Project <ExternalLink size={14} />
              </a>
            )}
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="card-link-btn" style={{ color: 'var(--text-secondary)' }}>
                GitHub <Github size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
