import React from "react";

interface NavbarProps {
  activeTab: "promotions" | "categories";
  onTabChange: (tab: "promotions" | "categories") => void;
  systemHealthy: boolean | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  systemHealthy,
}) => {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo / Brand */}
        <div className="navbar-brand">
          <div className="navbar-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
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
            <span className="navbar-title">Gestión de Promociones</span>
            <span className="navbar-subtitle">Módulo POS</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="navbar-tabs">
          <button
            id="tab-promotions"
            className={`navbar-tab ${activeTab === "promotions" ? "navbar-tab--active" : ""}`}
            onClick={() => onTabChange("promotions")}
            aria-current={activeTab === "promotions" ? "page" : undefined}
          >
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
            Promociones
          </button>

          <button
            id="tab-categories"
            className={`navbar-tab ${activeTab === "categories" ? "navbar-tab--active" : ""}`}
            onClick={() => onTabChange("categories")}
            aria-current={activeTab === "categories" ? "page" : undefined}
          >
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
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            Categorías
          </button>
        </div>

        {/* Server Health Indicator */}
        <div className="navbar-status">
          <span className="navbar-status-label">Servidor</span>
          {systemHealthy === null ? (
            <span className="navbar-status-badge navbar-status-badge--checking">
              <span className="status-dot status-dot--pulse"></span>
              Verificando
            </span>
          ) : systemHealthy ? (
            <span className="navbar-status-badge navbar-status-badge--online">
              <span className="status-dot status-dot--online"></span>
              Operativo
            </span>
          ) : (
            <span className="navbar-status-badge navbar-status-badge--offline">
              <span className="status-dot"></span>
              Desconectado
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};
