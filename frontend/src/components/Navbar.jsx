import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, LogOut, Mail, User, Menu, X, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenMessages }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, logout, unreadCount } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeMobile = () => setMobileOpen(false);

  const navLinks = [
    { label: 'Home', to: '/', internal: true },
    { label: 'Projects', to: '/projects', internal: true },
    { label: 'About', to: '/#about', internal: false },
    { label: 'Contact', to: '/#contact', internal: false },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="navbar"
      >
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="nav-logo-stacked" onClick={closeMobile}>
            <span className="logo-main">Nuthan Prasad.</span>
            <span className="logo-sub">KG</span>
          </Link>

          {/* ── Desktop layout ── */}
          <div className="nav-desktop">
            <ul className="nav-links">
              {navLinks.map(({ label, to, internal }) => (
                <li key={label}>
                  {internal
                    ? <Link to={to} className={`nav-link ${isActive(to) ? 'active' : ''}`}>{label}</Link>
                    : <a href={to} className="nav-link">{label}</a>
                  }
                </li>
              ))}
            </ul>

            {/* Hire Me CTA */}
            <Link
              to="/request"
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap', lineHeight: 1, display: 'inline-flex', alignItems: 'center', gap: 7 }}
            >
              <Globe size={14} /> Hire Me
            </Link>

            {/* Icon actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {isAdmin && (
                <>
                  <button onClick={onOpenMessages} className="theme-toggle" style={{ position: 'relative' }} title="Messages">
                    <Mail size={18} />
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: '#ef4444', color: '#fff',
                        fontSize: '0.6rem', fontWeight: 700,
                        width: '15px', height: '15px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <Link to="/profile" className="theme-toggle" title="Profile"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} />
                  </Link>
                  <Link to="/admin/requests" className="theme-toggle" title="Website Requests"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 'auto', padding: '0 10px',
                      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.03em',
                      background: isActive('/admin/requests') ? 'var(--accent-color)' : undefined,
                      color: isActive('/admin/requests') ? 'var(--accent-inverse)' : undefined,
                    }}>
                    Requests
                  </Link>
                  <button onClick={logout} className="theme-toggle" title="Logout">
                    <LogOut size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Mobile: right side (theme + hamburger) ── */}
          <div className="nav-mobile-right">
            <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="theme-toggle"
              title="Menu"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </motion.nav>

      {/* ── Mobile dropdown menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mobile-menu"
          >
            <ul className="mobile-nav-links">
              {navLinks.map(({ label, to, internal }) => (
                <li key={label}>
                  {internal
                    ? <Link to={to} className={`mobile-nav-link ${isActive(to) ? 'active' : ''}`} onClick={closeMobile}>{label}</Link>
                    : <a href={to} className="mobile-nav-link" onClick={closeMobile}>{label}</a>
                  }
                </li>
              ))}
              <li>
                <Link to="/request" className="mobile-nav-link" onClick={closeMobile}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={15} /> Hire Me
                </Link>
              </li>
            </ul>

            {isAdmin && (
              <div className="mobile-admin-bar">
                <button onClick={() => { onOpenMessages(); closeMobile(); }}
                  className="mobile-admin-btn" style={{ position: 'relative' }}>
                  <Mail size={16} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      background: '#ef4444', color: '#fff',
                      fontSize: '0.6rem', fontWeight: 700,
                      width: '14px', height: '14px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{unreadCount}</span>
                  )}
                </button>
                <Link to="/profile" className="mobile-admin-btn" onClick={closeMobile}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} />
                </Link>
                <Link to="/admin/requests" className="mobile-admin-btn" onClick={closeMobile}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, width: 'auto', padding: '0 10px' }}>
                  Requests
                </Link>
                <button onClick={() => { logout(); closeMobile(); }} className="mobile-admin-btn">
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
