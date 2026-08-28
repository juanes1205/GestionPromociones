import React, { useState } from "react";

interface Category {
  id: number;
  name: string;
  description?: string;
  _count?: { promotions: number };
}

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => Promise<void>;
  apiUrl: string;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onRefresh,
  apiUrl,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); 
  };

  const notify = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(msg);
      setError(null);
      setTimeout(() => setSuccess(null), 5000);
    } else {
      setError(msg);
      setSuccess(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notify("El nombre de la categoría es obligatorio.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(`Categoría "${data.name}" creada con éxito.`, "success");
      setName("");
      setDescription("");
      await onRefresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al crear la categoría.";
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) {
      notify("El nombre de la categoría es obligatorio.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(`Categoría actualizada con éxito.`, "success");
      cancelEdit();
      await onRefresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al actualizar la categoría.";
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteModalId === null) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/categories/${deleteModalId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(data.message, "success");
      await onRefresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al eliminar la categoría.";
      notify(message, "error");
    } finally {
      setDeleteModalId(null);
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Paginación de resultados
  const ITEMS_PER_PAGE = 10;
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="panel" style={{ marginTop: "2.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 className="panel-title" style={{ margin: 0 }}>
          Gestión de Categorías
        </h2>
        <button
          id="btn-nueva-categoria"
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
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
          Nueva Categoría
        </button>
      </div>

      {error && (
        <div
          className="alert alert-danger"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            &times;
          </button>
        </div>
      )}
      {success && (
        <div
          className="alert alert-success"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Modal: Crear Categoría */}
      {isCreateModalOpen && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateModalOpen(false);
          }}
        >
          <div className="modal-card" style={{ maxWidth: "500px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ margin: 0 }}>Nueva Categoría</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={submitting}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "1.4rem",
                  lineHeight: 1,
                  padding: "0.25rem",
                }}
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleCreate(e);
                setIsCreateModalOpen(false);
              }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">
                  Nombre
                </label>
                <input
                  id="cat-name"
                  type="text"
                  className="form-control"
                  placeholder="Ej. Electrónica"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-desc">
                  Descripción (opcional)
                </label>
                <input
                  id="cat-desc"
                  type="text"
                  className="form-control"
                  placeholder="Descripción breve..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-action-small"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Guardando..." : "Agregar Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtro de búsqueda */}
      <div className="filter-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label
            className="form-label"
            style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}
          >
            Buscar por Nombre
          </label>
          <input
            id="cat-search"
            type="text"
            className="form-control"
            placeholder="Filtrar categorías..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        {searchTerm && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              paddingBottom: "0.1rem",
            }}
          >
            <button
              className="btn-action-small"
              onClick={() => handleSearchChange("")}
              title="Limpiar filtro"
            >
              ✕ Limpiar
            </button>
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            paddingBottom: "0.1rem",
          }}
        >
          <span className="filter-results-count">
            {searchTerm
              ? `${totalItems} de ${categories.length} categorías`
              : `${categories.length} categorías`}
          </span>
        </div>
      </div>

      {/* Listado de categorías */}
      <div className="table-wrapper">
        <table className="promotions-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th style={{ textAlign: "center" }}>Promociones</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center"
                  style={{ color: "var(--text-secondary)", padding: "2rem" }}
                >
                  No hay categorías registradas.
                </td>
              </tr>
            ) : totalItems === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center"
                  style={{ color: "var(--text-secondary)", padding: "2rem" }}
                >
                  No se encontraron categorías que coincidan con &ldquo;
                  {searchTerm}&rdquo;.
                </td>
              </tr>
            ) : (
              paginatedCategories.map((cat) => (
                <tr key={cat.id}>
                  <td
                    style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}
                  >
                    {cat.id}
                  </td>

                  {editingId === cat.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          disabled={submitting}
                          style={{
                            padding: "0.45rem 0.75rem",
                            fontSize: "0.9rem",
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          disabled={submitting}
                          style={{
                            padding: "0.45rem 0.75rem",
                            fontSize: "0.9rem",
                          }}
                          placeholder="Sin descripción"
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="badge badge-scheduled">
                          {cat._count?.promotions ?? 0}
                        </span>
                      </td>
                      <td>
                        <div
                          className="flex-actions"
                          style={{ justifyContent: "flex-end" }}
                        >
                          <button
                            className="btn-action-small btn-success"
                            onClick={() => handleUpdate(cat.id)}
                            disabled={submitting}
                          >
                            Guardar
                          </button>
                          <button
                            className="btn-action-small"
                            onClick={cancelEdit}
                            disabled={submitting}
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      </td>
                      <td
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {cat.description || (
                          <em style={{ color: "var(--text-muted)" }}>
                            Sin descripción
                          </em>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="badge badge-scheduled">
                          {cat._count?.promotions ?? 0}
                        </span>
                      </td>
                      <td>
                        <div
                          className="flex-actions"
                          style={{ justifyContent: "flex-end" }}
                        >
                          <button
                            className="btn-action-small"
                            onClick={() => startEdit(cat)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn-outline-danger"
                            onClick={() => setDeleteModalId(cat.id)}
                            title={
                              (cat._count?.promotions ?? 0) > 0
                                ? "No se puede eliminar: tiene promociones asociadas"
                                : "Eliminar categoría"
                            }
                            disabled={(cat._count?.promotions ?? 0) > 0}
                            style={{
                              opacity:
                                (cat._count?.promotions ?? 0) > 0 ? 0.4 : 1,
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModalId !== null && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>¿Eliminar Categoría?</h3>
            <p>
              ¿Estás seguro de que deseas eliminar esta categoría? Esta acción
              es permanente. Solo se puede eliminar si no tiene promociones
              asociadas.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-action-small"
                onClick={() => setDeleteModalId(null)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} de {totalItems}{" "}
            categorías
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