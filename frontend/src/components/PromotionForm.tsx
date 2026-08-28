import React, { useState } from 'react';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface PromotionSubmitData {
  name: string;
  categoryId: number;
  discountType: 'PORCENTAJE' | 'MONTO_FIJO';
  discountValue: number;
  startDate: string;
  endDate: string;
}

interface PromotionFormProps {
  categories: Category[];
  onSubmit: (data: PromotionSubmitData) => Promise<boolean>;
  submitting: boolean;
  onClose: () => void;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({ categories, onSubmit, submitting, onClose }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [discountType, setDiscountType] = useState<'PORCENTAJE' | 'MONTO_FIJO'>('PORCENTAJE');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Validaciones básicas en frontend
    if (!name.trim()) {
      setError('El nombre de la promoción es obligatorio.');
      return;
    }
    if (!categoryId) {
      setError('Debe seleccionar una categoría.');
      return;
    }
    if (!discountValue) {
      setError('Debe ingresar el valor del descuento.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Las fechas de inicio y fin son obligatorias.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setError('El valor del descuento debe ser un número positivo.');
      return;
    }

    if (discountType === 'PORCENTAJE' && (val < 1 || val > 100)) {
      setError('Si el tipo de descuento es Porcentaje, el valor debe estar entre 1 y 100.');
      return;
    }

    // Enviar datos
    const success = await onSubmit({
      name,
      categoryId: Number(categoryId),
      discountType,
      discountValue: val,
      startDate: new Date(`${startDate}T00:00:00-05:00`).toISOString(),
      endDate: new Date(`${endDate}T23:59:59-05:00`).toISOString(),
    });

    if (success) {
      // Limpiar formulario si se guardó con éxito y cerrar modal
      setName('');
      setCategoryId('');
      setDiscountType('PORCENTAJE');
      setDiscountValue('');
      setStartDate('');
      setEndDate('');
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card" style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="panel-title" style={{ margin: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', flexShrink: 0 }}>
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            Nueva Promoción
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1, padding: '0.25rem' }}
            title="Cerrar"
          >
            &times;
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="promo-name">Nombre de la Promoción</label>
            <input
              id="promo-name"
              type="text"
              className="form-control"
              placeholder="Ej. Descuento de Primavera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="promo-category">Categoría Asociada</label>
            <select
              id="promo-category"
              className="form-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={submitting}
            >
              <option value="">-- Seleccionar Categoría --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="promo-type">Tipo Descuento</label>
              <select
                id="promo-type"
                className="form-control"
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'PORCENTAJE' | 'MONTO_FIJO')}
                disabled={submitting}
              >
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="MONTO_FIJO">Monto fijo ($)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="promo-value">Valor</label>
              <input
                id="promo-value"
                type="number"
                step="any"
                className="form-control"
                placeholder={discountType === 'PORCENTAJE' ? '1 - 100' : '0.00'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="promo-start">Fecha Inicio</label>
              <input
                id="promo-start"
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="promo-end">Fecha Fin</label>
              <input
                id="promo-end"
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-action-small"
              onClick={onClose}
              disabled={submitting}
              style={{ width: 'auto' }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: 'auto' }}>
              {submitting ? 'Guardando...' : 'Crear Promoción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
