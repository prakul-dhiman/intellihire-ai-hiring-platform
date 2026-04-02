import React from 'react';

export default function LogoSVG({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'inline-block' }}>
      {/* Background soft glow behind everything */}
      <circle cx="60" cy="60" r="50" fill="#4F8EF7" fillOpacity="0.15" filter="url(#bg_glow)" />

      {/* Dynamic Hexagon Base */}
      <path d="M60 10 L105 35 L105 85 L60 110 L15 85 L15 35 Z" fill="url(#hex_grad)" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      
      {/* Inner Glowing AI Pattern */}
      <path d="M60 25 L90 42 L90 78 L60 95 L30 78 L30 42 Z" fill="rgba(79, 142, 247, 0.08)" stroke="url(#inner_grad)" strokeWidth="4" strokeLinejoin="round" />
      
      {/* Cyber/AI Core Connections */}
      <circle cx="60" cy="60" r="16" fill="url(#core_grad)" />
      
      {/* Center dot */}
      <circle cx="60" cy="60" r="6" fill="#0A0B0F" />
      
      {/* Connector lines to nodes */}
      <path d="M60 25 V44 M30 78 L46 68 M90 78 L74 68" stroke="url(#inner_grad)" strokeWidth="5" strokeLinecap="round" />
      
      {/* Active green node at top - symbolizing hiring complete/success */}
      <circle cx="60" cy="25" r="7" fill="#2ECC8A" style={{ filter: 'drop-shadow(0 0 6px rgba(46, 204, 138, 0.8))' }} />
      <circle cx="30" cy="78" r="6" fill="#4F8EF7" />
      <circle cx="90" cy="78" r="6" fill="#7B5EF8" />

      <defs>
        <filter id="bg_glow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
        <linearGradient id="hex_grad" x1="15" y1="10" x2="105" y2="110">
          <stop stopColor="#1E2130" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0A0B0F" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="inner_grad" x1="30" y1="25" x2="90" y2="95">
          <stop stopColor="#4F8EF7" />
          <stop offset="1" stopColor="#7B5EF8" />
        </linearGradient>
        <linearGradient id="core_grad" x1="44" y1="44" x2="76" y2="76">
          <stop stopColor="#7B5EF8" />
          <stop offset="1" stopColor="#4F8EF7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
