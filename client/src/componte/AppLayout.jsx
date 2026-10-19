import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ThreeColumnLayout
 * Responsive layout prepared for Desktop, collapsing elegantly on mobile/tablets.
 *
 * @param {React.ReactNode} children - Main feed / center content
 * @param {React.ReactNode} [leftSidebar] - Optional left navigation or user summary
 * @param {React.ReactNode} [rightSidebar] - Optional right widgets or quick actions
 */
export function ThreeColumnLayout({ children, leftSidebar, rightSidebar }) {
  return (
    <div className="np-main-layout">
      {/* Left Column (Desktop) */}
      <aside className="np-sidebar-left">
        {leftSidebar || (
          <div className="np-sidebar-card">
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Quick Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Link to="/" className="btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <i className="fa-solid fa-house" style={{ width: 20 }} /> Feed
              </Link>
              <Link to="/Post" className="btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <i className="fa-regular fa-image" style={{ width: 20 }} /> Posts
              </Link>
              <Link to="/Search" className="btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ width: 20 }} /> Search
              </Link>
              <Link to="/Message" className="btn-secondary" style={{ justifyContent: 'flex-start' }}>
                <i className="fa-regular fa-comment-dots" style={{ width: 20 }} /> Messages
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Center Column (Feed / Main Focus) */}
      <main className="np-feed-column">
        {children}
      </main>

      {/* Right Column (Desktop) */}
      <aside className="np-sidebar-right">
        {rightSidebar || (
          <div className="np-sidebar-card">
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              About Network-Plus
            </h4>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              A modern, minimal social networking application designed for clear communication and creative sharing.
            </p>
            <div style={{ borderTop: 'var(--border-default)', paddingTop: 'var(--space-3)' }}>
              <Link to="/Add" className="btn-primary" style={{ width: '100%' }}>
                <i className="fa-solid fa-plus" /> Create Post
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

/**
 * SingleColumnLayout
 * For pages that only require centered or single-container layout (Settings, EditProfile, AddPost, etc.)
 */
export function SingleColumnLayout({ children, maxWidth = 'var(--max-content-width)' }) {
  return (
    <div className="np-content-single" style={{ maxWidth }}>
      {children}
    </div>
  );
}
