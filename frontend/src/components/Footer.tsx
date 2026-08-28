import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Left: Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
          <div>
            <p className="footer-name">Gestión de Promociones</p>
            <p className="footer-desc">
              Sistema de Gestión de Promociones y Descuentos
            </p>
          </div>
        </div>

        {/* Center: Tech Stack */}
        <div className="footer-stack">
          <span className="footer-chip">React</span>
          <span className="footer-chip">TypeScript</span>
          <span className="footer-chip">Node.js</span>
          <span className="footer-chip">Prisma</span>
          <span className="footer-chip">PostgreSQL</span>
        </div>

        {/* Right: Copyright */}
        <div className="footer-copy">
          <p>© {currentYear}</p>
          <p className="footer-version">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
};
