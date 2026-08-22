import React from 'react';

// Shimmer animation via CSS keyframes
const shimmerStyle = {
  background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--card-hover) 50%, var(--bg-secondary) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: '8px',
};

// Inject keyframe animation
if (typeof document !== 'undefined' && !document.getElementById('skeleton-style')) {
  const style = document.createElement('style');
  style.id = 'skeleton-style';
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export const SkeletonBox = ({ width = '100%', height = 16, style = {} }) => (
  <div style={{ width, height, ...shimmerStyle, ...style }} />
);

export const SkeletonCard = () => (
  <div
    style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {/* Image area */}
    <div style={{ ...shimmerStyle, height: 220, borderRadius: 0 }} />
    {/* Content */}
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SkeletonBox height={12} width="40%" />
      <SkeletonBox height={20} width="80%" />
      <SkeletonBox height={14} width="100%" />
      <SkeletonBox height={14} width="90%" />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <SkeletonBox height={24} width={60} style={{ borderRadius: 999 }} />
        <SkeletonBox height={24} width={60} style={{ borderRadius: 999 }} />
        <SkeletonBox height={24} width={60} style={{ borderRadius: 999 }} />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
