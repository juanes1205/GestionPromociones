import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PromotionForm } from './components/PromotionForm';
import { PromotionList } from './components/PromotionList';
import { CategoryManager } from './components/CategoryList';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
  discountType: 'PORCENTAJE' | 'MONTO_FIJO';
  discountValue: number;
  startDate: string;
  endDate: string;
  status: 'PROGRAMADA' | 'ACTIVA' | 'FINALIZADA';
}

interface SummaryData {
  PROGRAMADA: number;
  ACTIVA: number;
  FINALIZADA: number;
  vigentesHoy: number;
}

function App() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    PROGRAMADA: 0,
    ACTIVA: 0,
    FINALIZADA: 0,
    vigentesHoy: 0,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [systemHealthy, setSystemHealthy] = useState<boolean | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'promotions' | 'categories'>('promotions');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Cargar datos al ejecutar la aplicación
  useEffect(() => {
    fetchCategories();
    fetchPromotionsAndSummary();
    checkSystemHealth();

    // Health check cada 30 segundos
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkSystemHealth() {
    try {
      const res = await fetch(`${API_URL}/health`);
      if (res.ok) {
        setSystemHealthy(true);
      } else {
        setSystemHealthy(false);
      }
    } catch {
      setSystemHealthy(false);
    }
  };

  async function fetchCategories() {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    }
  };

  async function fetchPromotionsAndSummary() {
    setLoading(true);
    try {
      // Cargar promociones
      const resPromos = await fetch(`${API_URL}/api/promotions`);
      if (!resPromos.ok) throw new Error('Error al cargar listado de promociones');
      const promosData = await resPromos.json();
      setPromotions(promosData);

      // Cargar resumen
      const resSummary = await fetch(`${API_URL}/api/promotions/summary`);
      if (!resSummary.ok) throw new Error('Error al cargar el resumen');
      const summaryData = await resSummary.json();
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Error de conexión al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Recarga completa: categorías + promociones + summary en paralelo
  async function fetchAll() {
    await Promise.all([fetchCategories(), fetchPromotionsAndSummary()]);
  }

  const handleCreatePromotion = async (formData: any): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la promoción');
      }

      setSuccess('¡Promoción creada exitosamente!');
      await fetchPromotionsAndSummary();
      
      // Auto-limpiar el mensaje de éxito tras 5s
      setTimeout(() => setSuccess(null), 5000);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al intentar guardar la promoción');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  async function handleDeletePromotion(id: number) {
    setPromoToDelete(id);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (promoToDelete === null) return;
    setDeleteModalOpen(false);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/promotions/${promoToDelete}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar la promoción');
      }

      setSuccess('Promoción eliminada con éxito.');
      await fetchPromotionsAndSummary();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Error al intentar eliminar la promoción');
    } finally {
      setPromoToDelete(null);
    }
  }

  const handleStatusChange = async (id: number, nextStatus: 'ACTIVA' | 'FINALIZADA') => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/promotions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cambiar el estado');
      }

      const statusName = nextStatus === 'ACTIVA' ? 'Activa' : 'Finalizada';
      setSuccess(`Estado actualizado a ${statusName} con éxito.`);
      await fetchPromotionsAndSummary();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado de la promoción');
    }
  };

  return (
    <div className="app-wrapper">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        systemHealthy={systemHealthy}
      />

      <div className="app-container">

      {/* Alertas de Éxito / Error globales */}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)} 
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            &times;
          </button>
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{success}</span>
          <button 
            onClick={() => setSuccess(null)} 
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Contadores Estadísticos */}
      <Dashboard summary={summary} loading={loading} />

      {/* Contenido Principal Grid */}
      <main className="main-content" style={{ gridTemplateColumns: '1fr' }}>
        {activeTab === 'promotions' ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <PromotionList 
              promotions={promotions} 
              categories={categories}
              onDelete={handleDeletePromotion} 
              onStatusChange={handleStatusChange} 
              loading={loading}
              onNewPromotion={() => setIsFormOpen(true)}
            />
          </div>
        ) : (
          <div style={{ gridColumn: '1 / -1' }}>
            <CategoryManager
              categories={categories}
              apiUrl={API_URL}
              onRefresh={fetchAll}
            />
          </div>
        )}
      </main>

      {/* Modal: Crear Promoción */}
      {isFormOpen && (
        <PromotionForm
          categories={categories}
          onSubmit={handleCreatePromotion}
          submitting={submitting}
          onClose={() => setIsFormOpen(false)}
        />
      )}


      {deleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>¿Eliminar Promoción?</h3>
            <p>¿Estás seguro de que deseas eliminar esta promoción? Esta acción es permanente y no se puede deshacer.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-action-small" 
                onClick={() => { setDeleteModalOpen(false); setPromoToDelete(null); }}
              >
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      <Footer />
    </div>
  );
}

export default App;
