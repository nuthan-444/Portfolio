import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, LogOut, Mail, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenMessages }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, logout, unreadCount } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="navbar"
    >
      <div className="navbar-container">
        {/* Stacked Minimal Logo */}
        <Link to="/" className="nav-logo-stacked">
          <span className="logo-main">Nuthan Prasad.</span>
          <span className="logo-sub">KG</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            </li>
            <li>
              <Link to="/projects" className={`nav-link ${isActive('/projects') ? 'active' : ''}`}>Projects</Link>
            </li>
            <li>
              <a href="/#about" className="nav-link">About</a>
            </li>
            <li>
              <a href="/#contact" className="nav-link">Contact</a>
            </li>
          </ul>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={onOpenMessages}
                  className="theme-toggle"
                  style={{ position: 'relative' }}
                  title="Admin Messages Inbox"
                >
                  <Mail size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
                <Link
                  to="/profile"
                  className="theme-toggle"
                  title="Admin Profile Settings"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <User size={18} />
                </Link>
                <button
                  onClick={logout}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  title="Logout Admin"
                >
                  <LogOut size={14} /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
