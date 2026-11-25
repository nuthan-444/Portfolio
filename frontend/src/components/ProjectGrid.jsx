import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { SkeletonCard } from './Skeleton';

const FILTERS = ['All', 'Web Dev', 'AI/ML'];

const ProjectGrid = ({ projects, onEdit, onDelete, loading, onProjectClick }) => {
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [sortOrder, setSortOrder] = React.useState('newest'); // 'newest' | 'oldest'

  // Sort by projectDate (falling back to createdAt), then apply category filter
  const sorted = [...projects].sort((a, b) => {
    const dateA = new Date(a.projectDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.projectDate || b.createdAt || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const filtered = activeFilter === 'All' ? sorted : sorted.filter((p) => p.category === activeFilter);

  return (
    <div>
      {/* Category Filter Pills + Date Sort Toggle */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', marginBottom: '36px', flexWrap: 'wrap' }}>
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              padding: '8px 20px',
              borderRadius: 9999,
              border: '1px solid var(--border-color)',
              background: activeFilter === filter ? 'var(--accent-color)' : 'var(--badge-bg)',
              color: activeFilter === filter ? 'var(--accent-inverse)' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {filter}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
          title="Reorder projects by date"
          style={{
            padding: '8px 16px',
            borderRadius: 9999,
            border: '1px solid var(--border-color)',
            background: 'var(--badge-bg)',
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
        >
          {sortOrder === 'newest' ? <ArrowDownWideNarrow size={15} /> : <ArrowUpNarrowWide size={15} />}
          {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* Pinterest Masonry Grid */}
      {loading ? (
        <div style={{
          columns: '3 280px',
          columnGap: '24px',
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ breakInside: 'avoid', marginBottom: '24px' }}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <p>No projects found in this category yet.</p>
        </div>
      ) : (
        <div style={{
          columns: '3 280px',
          columnGap: '24px',
        }}>
          <AnimatePresence>
            {filtered.map((project) => (
              <div key={project._id} style={{ breakInside: 'avoid', marginBottom: '24px' }}>
                <ProjectCard
                  project={project}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onClickDetail={() => onProjectClick && onProjectClick(project)}
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ProjectGrid;
