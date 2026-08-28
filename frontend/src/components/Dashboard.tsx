import React from 'react';

interface SummaryData {
  PROGRAMADA: number;
  ACTIVA: number;
  FINALIZADA: number;
  vigentesHoy: number;
}

interface DashboardProps {
  summary: SummaryData;
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ summary, loading }) => {
  const displayValue = (val: number) => {
    return loading ? '...' : val;
  };

  return (
    <div className="stats-grid">
      <div className="stat-card stat-scheduled">
        <span className="stat-title">Programadas</span>
        <span className="stat-value">{displayValue(summary.PROGRAMADA)}</span>
      </div>

      <div className="stat-card stat-active">
        <span className="stat-title">Activas</span>
        <span className="stat-value">{displayValue(summary.ACTIVA)}</span>
      </div>

      <div className="stat-card stat-finished">
        <span className="stat-title">Finalizadas</span>
        <span className="stat-value">{displayValue(summary.FINALIZADA)}</span>
      </div>

      <div className="stat-card stat-today">
        <span className="stat-title">Vigentes Hoy</span>
        <span className="stat-value">{displayValue(summary.vigentesHoy)}</span>
      </div>
    </div>
  );
};
