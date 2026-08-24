import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import ProjectGrid from '../components/ProjectGrid';
import ProjectDetailModal from '../components/ProjectDetailModal';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Projects = ({ onAddProject, onEditProject, onDeleteProject }) => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data || []);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div style={{ paddingTop: 110, paddingBottom: 100, minHeight: '100vh' }}>
      <div className="container">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            PORTFOLIO ARCHIVE
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '16px', marginTop: '8px' }}>Projects & Creations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 24px auto' }}>
            Explore my collection of production-grade Web Applications, AI/ML tools, autonomous agent systems, and computer vision models.
          </p>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddProject}
              className="btn-primary"
              style={{ marginTop: '8px' }}
            >
              <Plus size={18} /> Add New Project
            </motion.button>
          )}
        </motion.div>

        <ProjectGrid
          projects={projects}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
          loading={loading}
          onProjectClick={(project) => setSelectedProject(project)}
        />
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null);
            if (isAdmin) fetchProjects(); // refresh count for admin
          }}
        />
      )}
    </div>
  );
};

export default Projects;
