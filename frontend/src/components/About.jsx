import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, Terminal, Sparkles, Server, Database, Globe, Workflow, CheckCircle2,
} from 'lucide-react';
import api from '../utils/api';
import { SkeletonSkillCard } from './Skeleton';

// Icon lookup (matches the icon names stored in the DB)
const ICON_MAP = {
  Sparkles: <Sparkles size={20} />,
  Globe: <Globe size={20} />,
  Database: <Database size={20} />,
  Cpu: <Cpu size={20} />,
  Terminal: <Terminal size={20} />,
  Server: <Server size={20} />,
  Workflow: <Workflow size={20} />,
};

const About = () => {
  const [skillDomains, setSkillDomains] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  useEffect(() => {
    api.get('/skills')
      .then((res) => setSkillDomains(res.data))
      .catch(() => {})
      .finally(() => setSkillsLoading(false));
  }, []);

  return (
    <section
      id="about"
      className="section"
      style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}
    >
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
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            marginBottom: '64px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Hi, I'm Nuthan Prasad KG</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '20px' }}>
            I am a full-stack engineer and AI/ML enthusiast dedicated to crafting clean, high-performance software applications. My core expertise centers around building autonomous AI agents, retrieval-augmented generation (RAG) pipelines, and responsive web platforms.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.8' }}>
            Currently, I am deeply focused on developing autonomous agentic workflows, Model Context Protocol (MCP) servers, and scalable web solutions using React, Node.js, and MongoDB. I love turning complex technical challenges into simple, elegant products.
          </p>
        </motion.div>

        {/* Key Skills Grid — DB driven with skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 10 }}
        >
          <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Skills & Concepts</h3>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '80px' }}>
          {skillsLoading
            ? [...Array(3)].map((_, i) => <SkeletonSkillCard key={i} />)
            : skillDomains.length === 0
            ? (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                No skills added yet — add them from the Profile page.
              </p>
            )
            : skillDomains.map((cat, idx) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '28px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '10px', background: 'var(--badge-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                    {ICON_MAP[cat.icon] || <Cpu size={20} />}
                  </div>
                  <h4 style={{ fontSize: '1.2rem' }}>{cat.title}</h4>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cat.items.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default About;
