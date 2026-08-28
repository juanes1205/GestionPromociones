import React, { useState } from "react";
import { formatDate, isPromotionActiveToday } from "../utils/date";

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Promotion {
  id: number;
  name: string;
  categoryId: number;
  category: Category;
  discountType: "PORCENTAJE" | "MONTO_FIJO";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: "PROGRAMADA" | "ACTIVA" | "FINALIZADA";
}

interface PromotionListProps {
  promotions: Promotion[];
  categories: Category[];
  onDelete: (id: number) => Promise<void>;
  onStatusChange: (
    id: number,
    newStatus: "ACTIVA" | "FINALIZADA",
  ) => Promise<void>;
  loading: boolean;
  onNewPromotion: () => void;
}

export const PromotionList: React.FC<PromotionListProps> = ({
  promotions,
  categories,
  onDelete,
  onStatusChange,
  loading,
  onNewPromotion,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Handlers que actualizan el filtro y reinician la página síncronamente
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PROGRAMADA":
        return "badge badge-scheduled";
      case "ACTIVA":
        return "badge badge-active";
      case "FINALIZADA":
        return "badge badge-finished";
      default:
        return "badge";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PROGRAMADA":
        return "Programada";
      case "ACTIVA":
        return "Activa";
      case "FINALIZADA":
        return "Finalizada";
      default:
        return status;
    }
  };

  // Filtrar las promociones en base a la selección del usuario
  const filteredPromotions = promotions.filter((promo) => {
    const matchesName = promo.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || promo.status === statusFilter;
    const matchesCategory =
      categoryFilter === "" || promo.categoryId === Number(categoryFilter);
    return matchesName && matchesStatus && matchesCategory;
  });

  // Paginación de resultados
  const ITEMS_PER_PAGE = 10;
  const totalItems = filteredPromotions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPromotions = filteredPromotions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  if (loading && promotions.length === 0) {
    return (
      <div className="panel text-center">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: "1rem" }}>Cargando promociones...</p>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 className="panel-title" style={{ margin: 0 }}>
            Listado de Promociones
          </h2>
          <button
            id="btn-nueva-promocion-empty"
            className="btn btn-primary"
            onClick={onNewPromotion}
            style={{ width: "auto", gap: "0.4rem" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Promoción
          </button>
        </div>
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <path d="M12 14v4" />
            <path d="M10 16h4" />
          </svg>
          <p>No se encontraron promociones registradas.</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Haz clic en <strong>Nueva Promoción</strong> para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 className="panel-title" style={{ margin: 0 }}>
          Listado de Promociones
        </h2>
        <button
          id="btn-nueva-promocion"
          className="btn btn-primary"
          onClick={onNewPromotion}
          style={{ width: "auto", gap: "0.4rem" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Promoción
        </button>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="filter-bar">
        <div className="form-group" style={{ flex: 2 }}>
          <label
            className="form-label"
            style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}
          >
            Buscar por Nombre
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar promoción..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label
            className="form-label"
            style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}
          >
            Categoría
          </label>
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label
            className="form-label"
            style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}
          >
            Estado
          </label>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="PROGRAMADA">Programadas</option>
            <option value="ACTIVA">Activas</option>
            <option value="FINALIZADA">Finalizadas</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="promotions-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Descuento</th>
              <th>Vigencia</th>
              <th>Estado</th>
              <th>Vigente Hoy</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPromotions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center"
                  style={{
                    color: "var(--text-secondary)",
                    padding: "3rem 1rem",
                  }}
                >
                  No se encontraron promociones que coincidan con los filtros
                  aplicados.
                </td>
              </tr>
            ) : (
              paginatedPromotions.map((promo) => {
                const activeToday = isPromotionActiveToday(
                  promo.startDate,
                  promo.endDate,
                );

                return (
                  <tr key={promo.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{promo.name}</div>
                    </td>
                    <td>
                      <span className="promotion-category-display">
                        {promo.category?.name || "General"}
                      </span>
                    </td>
                    <td>
                      <span className="promotion-value-display">
                        {promo.discountType === "PORCENTAJE"
                          ? `${promo.discountValue}%`
                          : `$${promo.discountValue.toFixed(2)}`}
                      </span>
                      {promo.discountType === "PORCENTAJE" && (
                        <div
                          className="progress-bar-container"
                          title={`${promo.discountValue}% de descuento`}
                        >
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${promo.discountValue}%` }}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <div>Inicio: {formatDate(promo.startDate)}</div>
                      <div>Fin: {formatDate(promo.endDate)}</div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(promo.status)}>
                        {getStatusLabel(promo.status)}
                      </span>
                    </td>
                    <td>
                      {activeToday ? (
                        <span className="badge badge-today">Sí (Vigente)</span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          No
                        </span>
                      )}
                    </td>
                    <td>
                      <div
                        className="flex-actions"
                        style={{ justifyContent: "flex-end" }}
                      >
                        {/* Botones de cambio de estado lineales */}
                        {promo.status === "PROGRAMADA" && (
                          <button
                            className="btn-action-small btn-success"
                            onClick={() => onStatusChange(promo.id, "ACTIVA")}
                            title="Cambiar a Activa"
                          >
                            Activar
                          </button>
                        )}

                        {promo.status === "ACTIVA" && (
                          <button
                            className="btn-action-small"
                            style={{
                              borderColor: "var(--danger)",
                              color: "var(--danger)",
                            }}
                            onClick={() =>
                              onStatusChange(promo.id, "FINALIZADA")
                            }
                            title="Cambiar a Finalizada"
                          >
                            Finalizar
                          </button>
                        )}

                        {/* Botón de eliminación - Solo si está Programada */}
                        {promo.status === "PROGRAMADA" ? (
                          <button
                            className="btn-outline-danger"
                            onClick={() => onDelete(promo.id)}
                            title="Eliminar Promoción"
                          >
                            Eliminar
                          </button>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                            }}
                            title="Solo eliminable en estado Programada"
                          >
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} de {totalItems}{" "}
            promociones
          </div>
          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (page) => (
                <button
                  key={page}
                  className={`pagination-btn ${currentPage === page ? "pagination-btn--active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ),
            )}
            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
