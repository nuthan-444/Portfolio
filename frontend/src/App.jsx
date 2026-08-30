import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Profile from './pages/Profile';
import RequestWebsite from './pages/RequestWebsite';
import WebsiteRequests from './pages/WebsiteRequests';
import ProjectModal from './components/ProjectModal';
import MessagesModal from './components/MessagesModal';
import api from './utils/api';

function App() {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleOpenAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (formData, projectId) => {
    try {
      if (projectId) {
        await api.put(`/projects/${projectId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setIsProjectModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Failed to submit project:', err);
      alert('Error saving project. Please check backend logs.');
    }
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) return;
    try {
      await api.delete(`/projects/${project._id}`);
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Error deleting project.');
    }
  };

  return (
    <div className="app">
      <Navbar onOpenMessages={() => setIsMessagesModalOpen(true)} />

      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/projects"
            element={
              <Projects
                onAddProject={handleOpenAddProject}
                onEditProject={handleOpenEditProject}
                onDeleteProject={handleDeleteProject}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/request" element={<RequestWebsite />} />
          <Route path="/admin/requests" element={<WebsiteRequests />} />
        </Routes>
      </main>

      <Footer />

      {/* Admin Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
        initialData={editingProject}
      />

      <MessagesModal
        isOpen={isMessagesModalOpen}
        onClose={() => setIsMessagesModalOpen(false)}
      />
    </div>
  );
}

export default App;
