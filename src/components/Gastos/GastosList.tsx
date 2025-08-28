import React, { useState } from 'react';
import { useGastos, useProyectos, useConceptos } from '../../hooks/usedirectus';
import { directusApi } from '../../services/directus';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import './Gastos.css';

const GastosList: React.FC = () => {
  const { gastos, refetch } = useGastos();
  const { proyectos } = useProyectos();
  const { conceptos } = useConceptos();
  const [showModal, setShowModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState<any>(null);
  const [filtroMetodo, setFiltroMetodo] = useState<string>('todos');
  const [formData, setFormData] = useState({
    Proyecto: '',
    Concepto: '',
    FechaCreacion: '',
    Importe: 0,
    MetodoPago: 'Efectivo',
    NumeroCheque: '',
    BancoEmisor: '',
    ChequeFechaVencimiento: '',
    EstadoPago: 'Pendiente',
    FechaPago: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenModal = (gasto?: any) => {
    if (gasto) {
      setEditingGasto(gasto);
      setFormData({
        Proyecto: typeof gasto.Proyecto === 'object' ? gasto.Proyecto.id : gasto.Proyecto,
        Concepto: typeof gasto.Concepto === 'object' ? gasto.Concepto.id : gasto.Concepto,
        FechaCreacion: new Date(gasto.FechaCreacion).toISOString().split('T')[0],
        Importe: gasto.Importe,
        MetodoPago: gasto.MetodoPago,
        NumeroCheque: gasto.NumeroCheque || '',
        BancoEmisor: gasto.BancoEmisor || '',
        ChequeFechaVencimiento: gasto.ChequeFechaVencimiento ? new Date(gasto.ChequeFechaVencimiento).toISOString().split('T')[0] : '',
        EstadoPago: gasto.EstadoPago,
        FechaPago: gasto.FechaPago ? new Date(gasto.FechaPago).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingGasto(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        Proyecto: '',
        Concepto: '',
        FechaCreacion: today,
        Importe: 0,
        MetodoPago: 'Efectivo',
        NumeroCheque: '',
        BancoEmisor: '',
        ChequeFechaVencimiento: '',
        EstadoPago: 'Pendiente',
        FechaPago: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGasto(null);
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = { ...formData };
      
      // Limpiar campos de cheque si no es método cheque
      if (formData.MetodoPago !== 'Cheque') {
        dataToSend.NumeroCheque = '';
        dataToSend.BancoEmisor = '';
        dataToSend.ChequeFechaVencimiento = '';
      }

      if (editingGasto) {
        await directusApi.updateGasto(editingGasto.id, dataToSend);
      } else {
        await directusApi.createGasto(dataToSend);
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error guardando gasto:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        await directusApi.deleteGasto(id);
        refetch();
      } catch (error) {
        console.error('Error eliminando gasto:', error);
      }
    }
  };

  const gastosFiltrados = filtroMetodo === 'todos' 
    ? gastos 
    : gastos.filter(gasto => gasto.MetodoPago.toLowerCase() === filtroMetodo);

  const renderModal = () => (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingGasto ? 'Editar Gasto' : 'Nuevo Gasto'}</h2>
          <button className="modal-close" onClick={handleCloseModal}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-row">
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
                    {proyecto.Descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Concepto</label>
              <select
                value={formData.Concepto}
                onChange={(e) => setFormData({...formData, Concepto: e.target.value})}
                className="form-input"
                required
              >
                <option value="">Seleccionar Concepto</option>
                {conceptos.map((concepto) => (
                  <option key={concepto.id} value={concepto.id}>
                    {concepto.Concepto}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Fecha Creación</label>
              <input
                type="date"
                value={formData.FechaCreacion}
                onChange={(e) => setFormData({...formData, FechaCreacion: e.target.value})}
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

          <div className="form-row">
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
              </select>
            </div>
            <div className="form-group">
              <label>Estado de Pago</label>
              <select
                value={formData.EstadoPago}
                onChange={(e) => setFormData({...formData, EstadoPago: e.target.value})}
                className="form-input"
                required
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
                <option value="Vencido">Vencido</option>
              </select>
            </div>
          </div>

          {formData.MetodoPago === 'Cheque' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Número de Cheque</label>
                  <input
                    type="text"
                    value={formData.NumeroCheque}
                    onChange={(e) => setFormData({...formData, NumeroCheque: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Banco Emisor</label>
                  <input
                    type="text"
                    value={formData.BancoEmisor}
                    onChange={(e) => setFormData({...formData, BancoEmisor: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={formData.ChequeFechaVencimiento}
                  onChange={(e) => setFormData({...formData, ChequeFechaVencimiento: e.target.value})}
                  className="form-input"
                />
              </div>
            </>
          )}

          {formData.EstadoPago === 'Pagado' && (
            <div className="form-group">
              <label>Fecha de Pago</label>
              <input
                type="date"
                value={formData.FechaPago}
                onChange={(e) => setFormData({...formData, FechaPago: e.target.value})}
                className="form-input"
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingGasto ? 'Actualizar' : 'Crear'} Gasto
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="gastos-container">
      <div className="box">
        <div className="box-header">
          <h2 className="box-title">Gastos</h2>
          <div className="header-actions">
            <div className="tabs">
              <button 
                className={`tab ${filtroMetodo === 'todos' ? 'active' : ''}`}
                onClick={() => setFiltroMetodo('todos')}
              >
                Todos
              </button>
              <button 
                className={`tab ${filtroMetodo === 'efectivo' ? 'active' : ''}`}
                onClick={() => setFiltroMetodo('efectivo')}
              >
                Efectivo
              </button>
              <button 
                className={`tab ${filtroMetodo === 'transferencia' ? 'active' : ''}`}
                onClick={() => setFiltroMetodo('transferencia')}
              >
                Transferencia
              </button>
              <button 
                className={`tab ${filtroMetodo === 'cheque' ? 'active' : ''}`}
                onClick={() => setFiltroMetodo('cheque')}
              >
                Cheques
              </button>
            </div>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} />
              Nuevo Gasto
            </button>
          </div>
        </div>
        <div className="box-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Proyecto</th>
                  <th>Método</th>
                  <th>Vencimiento</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="no-data">No hay gastos registrados</td>
                  </tr>
                ) : (
                  gastosFiltrados.map((gasto) => (
                    <tr key={gasto.id}>
                      <td>{gasto.id}</td>
                      <td>{new Date(gasto.FechaCreacion).toLocaleDateString()}</td>
                      <td>{typeof gasto.Concepto === 'object' ? gasto.Concepto.Concepto : `ID: ${gasto.Concepto}`}</td>
                      <td>{typeof gasto.Proyecto === 'object' ? gasto.Proyecto.Descripcion : `ID: ${gasto.Proyecto}`}</td>
                      <td>
                        <span className={`badge badge-${gasto.MetodoPago.toLowerCase()}`}>
                          {gasto.MetodoPago}
                          {gasto.NumeroCheque && ` #${gasto.NumeroCheque}`}
                        </span>
                      </td>
                      <td>
                        {gasto.ChequeFechaVencimiento 
                          ? new Date(gasto.ChequeFechaVencimiento).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td className="currency-danger">{formatCurrency(gasto.Importe)}</td>
                      <td>
                        <span className={`badge badge-${gasto.EstadoPago.toLowerCase()}`}>
                          {gasto.EstadoPago}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-icon" 
                          title="Editar"
                          onClick={() => handleOpenModal(gasto)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon btn-danger" 
                          title="Eliminar"
                          onClick={() => handleDelete(gasto.id)}
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

export default GastosList;