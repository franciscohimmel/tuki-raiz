import React, { useState } from 'react';
import { useIngresos, useProyectos } from '../../hooks/usedirectus';
import { directusApi } from '../../services/directus';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import './Ingresos.css';

const IngresosList: React.FC = () => {
  const { ingresos, refetch } = useIngresos();
  const { proyectos } = useProyectos();
  const [showModal, setShowModal] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState<any>(null);
  const [formData, setFormData] = useState({
    Proyecto: '',
    FechaPago: '',
    Importe: 0,
    MetodoPago: 'Efectivo'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenModal = (ingreso?: any) => {
    if (ingreso) {
      setEditingIngreso(ingreso);
      setFormData({
        Proyecto: typeof ingreso.Proyecto === 'object' ? ingreso.Proyecto.id : ingreso.Proyecto,
        FechaPago: new Date(ingreso.FechaPago).toISOString().split('T')[0],
        Importe: ingreso.Importe,
        MetodoPago: ingreso.MetodoPago
      });
    } else {
      setEditingIngreso(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        Proyecto: '',
        FechaPago: today,
        Importe: 0,
        MetodoPago: 'Efectivo'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIngreso(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingIngreso) {
        await directusApi.updateIngreso(editingIngreso.id, formData);
      } else {
        await directusApi.createIngreso(formData);
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error guardando ingreso:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
      try {
        await directusApi.deleteIngreso(id);
        refetch();
      } catch (error) {
        console.error('Error eliminando ingreso:', error);
      }
    }
  };

  const renderModal = () => (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingIngreso ? 'Editar Ingreso' : 'Nuevo Ingreso'}</h2>
          <button className="modal-close" onClick={handleCloseModal}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Proyecto</label>
            <select
              value={formData.Proyecto}
              onChange={(e) => setFormData({...formData, Proyecto: e.target.value})}
              className="form-input"
              required
            >
              <option value="">Seleccionar Proyecto</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.Descripcion} - {typeof proyecto.Cliente === 'object' ? `${proyecto.Cliente.Nombre} ${proyecto.Cliente.Apellido}` : `Cliente ID: ${proyecto.Cliente}`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Pago</label>
              <input
                type="date"
                value={formData.FechaPago}
                onChange={(e) => setFormData({...formData, FechaPago: e.target.value})}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Importe</label>
              <input
                type="number"
                value={formData.Importe}
                onChange={(e) => setFormData({...formData, Importe: parseFloat(e.target.value) || 0})}
                className="form-input"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Método de Pago</label>
            <select
              value={formData.MetodoPago}
              onChange={(e) => setFormData({...formData, MetodoPago: e.target.value})}
              className="form-input"
              required
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingIngreso ? 'Actualizar' : 'Crear'} Ingreso
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ingresos-container">
      <div className="box">
        <div className="box-header">
          <h2 className="box-title">Ingresos</h2>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Nuevo Ingreso
          </button>
        </div>
        <div className="box-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha Pago</th>
                  <th>Proyecto</th>
                  <th>Cliente</th>
                  <th>Método de Pago</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">No hay ingresos registrados</td>
                  </tr>
                ) : (
                  ingresos.map((ingreso) => (
                    <tr key={ingreso.id}>
                      <td>{ingreso.id}</td>
                      <td>{new Date(ingreso.FechaPago).toLocaleDateString()}</td>
                      <td>
                        {typeof ingreso.Proyecto === 'object' 
                          ? ingreso.Proyecto.Descripcion 
                          : `Proyecto ID: ${ingreso.Proyecto}`
                        }
                      </td>
                      <td>
                        {typeof ingreso.Proyecto === 'object' && typeof ingreso.Proyecto.Cliente === 'object'
                          ? `${ingreso.Proyecto.Cliente.Nombre} ${ingreso.Proyecto.Cliente.Apellido}`
                          : '-'
                        }
                      </td>
                      <td>
                        <span className={`badge badge-${ingreso.MetodoPago.toLowerCase()}`}>
                          {ingreso.MetodoPago}
                        </span>
                      </td>
                      <td className="currency-positive">{formatCurrency(ingreso.Importe)}</td>
                      <td>
                        <button 
                          className="btn-icon" 
                          title="Editar"
                          onClick={() => handleOpenModal(ingreso)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon btn-danger" 
                          title="Eliminar"
                          onClick={() => handleDelete(ingreso.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && renderModal()}
    </div>
  );
};

export default IngresosList;