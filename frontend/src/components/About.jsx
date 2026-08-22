import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Terminal, Sparkles, Server, Database, Globe, Workflow, CheckCircle2 } from 'lucide-react';

const SKILL_CATEGORIES = [
  {
    title: 'AI & Machine Learning',
    icon: <Sparkles size={20} />,
    items: ['LLM Fine-Tuning', 'Multi-Agent Systems', 'RAG Pipelines', 'Model Context Protocol (MCP)', 'PyTorch & LangChain', 'Vector DBs (Pinecone)'],
  },
  {
    title: 'Full-Stack Development',
    icon: <Globe size={20} />,
    items: ['React.js & Next.js', 'Node.js & Express', 'REST & GraphQL APIs', 'TailwindCSS & Vanilla CSS', 'System Architecture', 'Redux & Context API'],
  },
  {
    title: 'Database & DevOps',
    icon: <Database size={20} />,
    items: ['MongoDB & Mongoose', 'PostgreSQL & Prisma', 'Redis Caching', 'Cloudinary & S3', 'Docker & CI/CD', 'Vercel & Render Deployment'],
  },
];

const TIMELINE = [
  {
    year: '2025 - Present',
    role: 'Autonomous AI Agent Architect',
    description: 'Pioneering production RAG architectures, custom MCP toolkits, and LLM orchestration systems for automated enterprise workflows.',
  },
  {
    year: '2024',
    role: 'Full-Stack AI Developer',
    description: 'Built high-throughput web applications, real-time computer vision analyzers, and scalable Node.js microservices.',
  },
  {
    year: '2023',
    role: 'Core Software & Web Engineer',
    description: 'Focused on modern JavaScript, React ecosystems, database design, and algorithmic optimization.',
  },
];

const About = () => {
  return (
    <section id="about" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
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

        {/* Key Skills Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '80px' }}>
          {SKILL_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '28px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '10px', background: 'var(--badge-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  {cat.icon}
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

        {/* Learning / Experience Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '40px' }}>Journey & Milestones</h3>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {TIMELINE.map((item, index) => (
              <motion.div
                key={item.role}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '1.15rem' }}>{item.role}</h4>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', background: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: 999 }}>
                    {item.year}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
