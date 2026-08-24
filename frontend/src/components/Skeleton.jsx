import React from 'react';

// Inject keyframe animation once — uses translateX (GPU-accelerated) instead of background-position
if (typeof document !== 'undefined' && !document.getElementById('skeleton-style')) {
  const style = document.createElement('style');
  style.id = 'skeleton-style';
  style.textContent = `
    @keyframes shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(100%);  }
    }
    .skeleton-box {
      position: relative;
      overflow: hidden;
      background: var(--bg-secondary);
      border-radius: 8px;
    }
    .skeleton-box::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--card-hover, rgba(255,255,255,0.06)) 50%,
        transparent 100%
      );
      animation: shimmer 1.4s ease-in-out infinite;
      will-change: transform;
      transform: translateZ(0);
    }
  `;
  document.head.appendChild(style);
}

export const SkeletonBox = ({ width = '100%', height = 16, style = {}, className = '' }) => (
  <div
    className={`skeleton-box ${className}`}
    style={{ width, height, ...style }}
  />
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
    <div className="skeleton-box" style={{ height: 220, borderRadius: 0 }} />
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

// Generic skill-card skeleton for the About section
export const SkeletonSkillCard = () => (
  <div
    style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: 28,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <SkeletonBox height={40} width={40} style={{ borderRadius: 8 }} />
      <SkeletonBox height={20} width="55%" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[...Array(5)].map((_, i) => (
        <SkeletonBox key={i} height={14} width={`${75 + (i % 3) * 8}%`} />
      ))}
    </div>
  </div>
);

export default SkeletonCard;

