import React, { useState } from 'react';

export default function BugReportButton({ onClick, openBugCount = 0 }) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Report a Bug"
      aria-label="Report a bug"
      style={{
        position: 'fixed',
        bottom: 90,
        right: 24,
        zIndex: 999,
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF1744, #D50000)',
        border: '2px solid rgba(255,255,255,0.2)',
        color: '#fff',
        fontSize: 26,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: hover
          ? '0 8px 30px rgba(255,23,68,0.7), 0 0 40px rgba(255,23,68,0.3)'
          : '0 4px 20px rgba(255,23,68,0.5)',
        transform: hover ? 'scale(1.15) rotate(10deg)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      🐛
      {openBugCount > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4,
          width: 22, height: 22, borderRadius: '50%',
          background: '#FFD600', color: '#000',
          fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid rgba(0,0,0,0.2)',
          boxShadow: '0 2px 8px rgba(255,214,0,0.5)',
        }}>
          {openBugCount > 9 ? '9+' : openBugCount}
        </span>
      )}
      {hover && (
        <span style={{
          position: 'absolute', right: 66, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.85)', color: '#fff',
          padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          whiteSpace: 'nowrap', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          Report a Bug
        </span>
      )}
    </button>
  );
}
