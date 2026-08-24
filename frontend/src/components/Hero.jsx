import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useSiteConfig } from '../context/ConfigContext';
import { getLinkIcon } from '../utils/linkIcons';

const Hero = () => {
  const canvasRef = useRef(null);
  const config = useSiteConfig();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 150, 150, ${p.alpha})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 80,
      }}
    >
      {/* Background Particle Canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      />

      {/* Left Vertical Social Navigation Bar */}
      <motion.div
        className="social-vertical-bar"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {config.configLoading ? (
          // Skeleton placeholders while config is fetching
          <>
            {['GitHub', 'Twitter', 'LinkedIn', 'Email'].map((t) => (
              <span key={t} style={{ opacity: 0.35 }}>{t}</span>
            ))}
          </>
        ) : (
          <>
            {config.social.github && <a href={config.social.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
            {config.social.twitter && <a href={config.social.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>}
            {config.social.linkedin && <a href={config.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
            {config.social.email && <a href={`mailto:${config.social.email}`}>Email</a>}
            {(config.otherLinks || []).map((link) => (
              <a key={link._id || link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {getLinkIcon(link, 14)}{link.name}
              </a>
            ))}
          </>
        )}
      </motion.div>


      {/* Centered Hero Content */}
      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <motion.h1
            initial={{ opacity: 0, y: 35, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 6vw, 5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '20px',
              overflow: 'visible',
            }}
          >
            {/* Stylised name: NuthanK GPrasad — K behind 'n', G behind 'P' */}
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.35em', whiteSpace: 'nowrap', justifyContent: 'center' }}>

              {/* "NuthanK" — K sits behind the trailing n */}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{
                  position: 'absolute',
                  right: '-0.22em',
                  bottom: '-0.3em',
                  fontSize: '3em',
                  fontWeight: 900,
                  opacity: 0.18,
                  zIndex: 0,
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  marginRight: 'clamp(10px, 3.5vw, 50px)',
                }}>K</span>
                <span style={{ position: 'relative', zIndex: 1, letterSpacing: 'clamp(3px, 1.5vw, 20px)' }}>Nuthan</span>
              </span>

              {/* "GPrasad" — G sits behind the leading P */}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{
                  position: 'absolute',
                  left: '-0.22em',
                  bottom: '-0.3em',
                  fontSize: '3em',
                  fontWeight: 900,
                  opacity: 0.18,
                  zIndex: 0,
                  lineHeight: 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  marginLeft: 'clamp(5px, 2vw, 30px)',
                }}>G</span>
                <span style={{ position: 'relative', zIndex: 1, letterSpacing: 'clamp(3px, 1.5vw, 20px)' }}>Prasad</span>
              </span>

            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 25, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2.2vw, 1.35rem)',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              marginTop: "40px",
              marginBottom: '44px',
            }}
          >
            {config.tagline || 'Full-Stack Developer & AI/ML Engineer in India'}
          </motion.p>

          {/* Minimal CTA Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: '36px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <a href="#contact" className="minimal-link">
              Contact <ArrowRight size={18} className="minimal-arrow" />
            </a>
            <Link to="/projects" className="minimal-link">
              <div className='my-projects-btn'>Explore My Projects <ArrowRight size={18} className="minimal-arrow" /></div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
