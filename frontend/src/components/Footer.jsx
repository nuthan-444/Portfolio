import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Twitter, Mail, ArrowUp } from 'lucide-react';
import { useSiteConfig } from '../context/ConfigContext';
import { getLinkIcon } from '../utils/linkIcons';

const Footer = () => {
  const config = useSiteConfig();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '48px 0 36px 0',
      }}
    >
      <div className="container" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{config.ownerName || 'Nuthan Prasad KG'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {config.footerTagline || config.tagline || 'Full-Stack Developer | AI/ML Enthusiast | Autonomous Agent Architect'}
          </p>
        </div>

        {/* Social Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {config.social.github && (
            <a href={config.social.github} target="_blank" rel="noopener noreferrer" className="theme-toggle" title="GitHub">
              <Github size={18} />
            </a>
          )}
          {config.social.linkedin && (
            <a href={config.social.linkedin} target="_blank" rel="noopener noreferrer" className="theme-toggle" title="LinkedIn">
              <Linkedin size={18} />
            </a>
          )}
          {config.social.twitter && (
            <a href={config.social.twitter} target="_blank" rel="noopener noreferrer" className="theme-toggle" title="Twitter">
              <Twitter size={18} />
            </a>
          )}
          {config.social.email && (
            <a href={`mailto:${config.social.email}`} className="theme-toggle" title="Email">
              <Mail size={18} />
            </a>
          )}
          {(config.otherLinks || []).map((link) => (
            <a key={link._id || link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="theme-toggle" title={link.name}>
              {getLinkIcon(link, 18)}
            </a>
          ))}
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Nuthan Prasad KG. All rights reserved. Built with React, Vite, Express, & MongoDB.
        </p>

        {/* Sticky Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="go-top-btn"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ArrowUp size={22} />
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;
