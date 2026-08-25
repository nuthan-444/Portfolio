import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, Terminal, Sparkles, Server, Database, Globe, Workflow, CheckCircle2,
} from 'lucide-react';
import api from '../utils/api';
import { SkeletonSkillCard } from './Skeleton';

const ICON_MAP = {
  Sparkles: <Sparkles size={20} />,
  Globe: <Globe size={20} />,
  Database: <Database size={20} />,
  Cpu: <Cpu size={20} />,
  Terminal: <Terminal size={20} />,
  Server: <Server size={20} />,
  Workflow: <Workflow size={20} />,
};

/* ─── Inline styles for monochrome glass + interactions ─── */
const GlassStyles = () => (
  <style>{`
    /* ── Bio Card ── */
    .about-bio-glass {
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(28px) saturate(160%);
      -webkit-backdrop-filter: blur(28px) saturate(160%);
      background: rgba(255,255,255,0.60);
      border: 1px solid rgba(255,255,255,0.85);
      box-shadow:
        0 8px 32px rgba(0,0,0,0.10),
        0 1px 0 rgba(255,255,255,1) inset,
        0 -1px 0 rgba(0,0,0,0.05) inset;
      padding: 40px;
      margin-bottom: 64px;
      transition: box-shadow 0.4s ease, transform 0.4s ease;
    }
    [data-theme='dark'] .about-bio-glass {
      background: rgba(18,18,21,0.60);
      border: 1px solid rgba(255,255,255,0.10);
      box-shadow:
        0 8px 40px rgba(0,0,0,0.55),
        0 1px 0 rgba(255,255,255,0.06) inset,
        0 -1px 0 rgba(0,0,0,0.3) inset;
    }

    /* Solid top border — black in light, white in dark */
    .about-bio-glass::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: #000000;
      opacity: 0.85;
    }
    [data-theme='dark'] .about-bio-glass::before {
      background: #ffffff;
      opacity: 0.6;
    }

    /* Soft inner light leak */
    .about-bio-glass::after {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%);
      pointer-events: none;
    }
    [data-theme='dark'] .about-bio-glass::after {
      background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%);
    }

    .about-bio-glass:hover {
      transform: translateY(-3px);
      box-shadow:
        0 20px 50px rgba(0,0,0,0.14),
        0 1px 0 rgba(255,255,255,1) inset;
    }
    [data-theme='dark'] .about-bio-glass:hover {
      box-shadow:
        0 20px 50px rgba(0,0,0,0.7),
        0 1px 0 rgba(255,255,255,0.08) inset;
    }

    /* ── Skill Cards ── */
    .about-skill-glass {
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      background: rgba(255,255,255,0.50);
      border: 1px solid rgba(255,255,255,0.75);
      box-shadow:
        0 4px 20px rgba(0,0,0,0.08),
        0 1px 0 rgba(255,255,255,0.9) inset;
      padding: 28px;
      cursor: default;
      transition:
        transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
        box-shadow 0.35s ease,
        background 0.35s ease,
        border-color 0.35s ease;
    }
    [data-theme='dark'] .about-skill-glass {
      background: rgba(24,24,27,0.50);
      border: 1px solid rgba(255,255,255,0.09);
      box-shadow:
        0 4px 24px rgba(0,0,0,0.45),
        0 1px 0 rgba(255,255,255,0.04) inset;
    }

    /* Minimal top-left shine */
    .about-skill-glass::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(255,255,255,0.45) 0%,
        transparent 50%
      );
      pointer-events: none;
      transition: opacity 0.35s ease;
      opacity: 1;
    }
    [data-theme='dark'] .about-skill-glass::before {
      background: linear-gradient(
        135deg,
        rgba(255,255,255,0.06) 0%,
        transparent 50%
      );
    }

    /* Spotlight circle that follows mouse */
    .about-skill-glass::after {
      content: '';
      position: absolute;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.08) 40%, transparent 70%);
      transform: translate(-50%, -50%);
      left: var(--mx, 50%);
      top: var(--my, 50%);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    [data-theme='dark'] .about-skill-glass::after {
      background: radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 40%, transparent 70%);
    }

    .about-skill-glass:hover {
      transform: translateY(-8px) scale(1.02);
      background: rgba(255,255,255,0.72);
      border-color: rgba(0,0,0,0.18);
      box-shadow:
        0 20px 50px rgba(0,0,0,0.14),
        0 1px 0 rgba(255,255,255,1) inset,
        0 0 0 1px rgba(0,0,0,0.06);
    }
    [data-theme='dark'] .about-skill-glass:hover {
      background: rgba(30,30,35,0.72);
      border-color: rgba(255,255,255,0.2);
      box-shadow:
        0 20px 50px rgba(0,0,0,0.7),
        0 1px 0 rgba(255,255,255,0.08) inset;
    }

    .about-skill-glass:hover::after {
      opacity: 1;
    }

    /* Icon badge */
    .about-icon-badge {
      padding: 10px;
      background: rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.10);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s ease, transform 0.3s ease;
    }
    [data-theme='dark'] .about-icon-badge {
      background: rgba(255,255,255,0.07);
      border-color: rgba(255,255,255,0.10);
    }
    .about-skill-glass:hover .about-icon-badge {
      background: rgba(0,0,0,0.12);
      transform: scale(1.1) rotate(-4deg);
    }
    [data-theme='dark'] .about-skill-glass:hover .about-icon-badge {
      background: rgba(255,255,255,0.12);
    }

    /* List item hover */
    .about-skill-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-secondary);
      font-size: 0.95rem;
      padding: 4px 6px;
      transition: color 0.2s ease, transform 0.2s ease;
      border-radius: 0;
    }
    .about-skill-item:hover {
      color: var(--text-primary);
      transform: translateX(4px);
    }
    .about-skill-item:hover .about-check-icon {
      stroke: var(--text-primary);
    }

    .about-check-icon {
      flex-shrink: 0;
      color: var(--text-muted);
      transition: color 0.2s ease;
    }
  `}</style>
);

/* ── Skill Card with mouse-tracking spotlight ── */
const SkillCard = ({ cat, idx }) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ref.current.style.setProperty('--mx', `${x}px`);
    ref.current.style.setProperty('--my', `${y}px`);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: idx * 0.12 }}
      className="about-skill-glass"
      onMouseMove={handleMouseMove}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
        <div className="about-icon-badge">
          {ICON_MAP[cat.icon] || <Cpu size={20} />}
        </div>
        <h4 style={{ fontSize: '1.2rem' }}>{cat.title}</h4>
      </div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', zIndex: 1 }}>
        {cat.items.map((item) => (
          <li key={item} className="about-skill-item">
            <CheckCircle2 size={15} className="about-check-icon" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const About = () => {
  const [skillDomains, setSkillDomains] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  useEffect(() => {
    api.get('/skills')
      .then((res) => setSkillDomains(res.data))
      .catch(() => { })
      .finally(() => setSkillsLoading(false));
  }, []);

  return (
    <section
      id="about"
      className="section"
      style={{ background: 'transparent', borderTop: 'none', borderBottom: '1px solid var(--border-color)' }}
    >
      <GlassStyles />
      <div className="container">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">About Me</h2>
          <p className="section-subtitle">
            Passionate software engineer building intelligent systems at the intersection of AI/ML and full-stack web development.
          </p>
        </motion.div>

        {/* Bio Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="about-bio-glass"
        >
          {/* Bottom-left counter-light */}
          <div style={{
            position: 'absolute', bottom: '-50px', left: '-50px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
            Hi, I'm Nuthan Prasad KG
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.85', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
            I am a <strong style={{ color: 'var(--text-primary)' }}>full-stack engineer</strong> and{' '}
            <strong style={{ color: 'var(--text-primary)' }}>AI/ML enthusiast</strong> dedicated to crafting clean,
            high-performance software applications. My core expertise centers around building autonomous AI agents,
            retrieval-augmented generation (RAG) pipelines, and responsive web platforms.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.85', position: 'relative', zIndex: 1 }}>
            Currently, I am deeply focused on developing autonomous agentic workflows,{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Model Context Protocol (MCP)</strong> servers,
            and scalable web solutions using React, Node.js, and MongoDB. I love turning complex technical challenges into
            simple, elegant products.
          </p>
        </motion.div>

        {/* Skills Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 10 }}
        >
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Skills &amp; Concepts</h3>
        </motion.div>

        {/* Skill Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '80px' }}>
          {skillsLoading
            ? [...Array(3)].map((_, i) => <SkeletonSkillCard key={i} />)
            : skillDomains.length === 0
              ? <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No skills added yet.</p>
              : skillDomains.map((cat, idx) => (
                <SkillCard key={cat._id} cat={cat} idx={idx} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default About;
