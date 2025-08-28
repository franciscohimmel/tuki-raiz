import React, { useState } from 'react';
import { useProyectos, useClientes, useEstados } from '../../hooks/usedirectus';
import { directusApi } from '../../services/directus';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import './Proyectos.css';

const ProyectosList: React.FC = () => {
  const { proyectos, refetch } = useProyectos();
  const { clientes } = useClientes();
  const { estados } = useEstados();

  // 📌 Estados para filtros
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<any>(null);
  const [formData, setFormData] = useState({
    Cliente: '',
    Descripcion: '',
    Estado: '',
    FechaCreacion: '',
    FechaEntrega: '',
    Importe: 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenModal = (proyecto?: any) => {
    if (proyecto) {
      setEditingProyecto(proyecto);
      setFormData({
        Cliente: typeof proyecto.Cliente === 'object' ? proyecto.Cliente.id : proyecto.Cliente,
        Descripcion: proyecto.Descripcion,
        Estado: typeof proyecto.Estado === 'object' ? proyecto.Estado.id : proyecto.Estado,
        FechaCreacion: new Date(proyecto.FechaCreacion).toISOString().split('T')[0],
        FechaEntrega: new Date(proyecto.FechaEntrega).toISOString().split('T')[0],
        Importe: proyecto.Importe
      });
    } else {
      setEditingProyecto(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        Cliente: '',
        Descripcion: '',
        Estado: estados.length > 0 ? estados[0].id.toString() : '',
        FechaCreacion: today,
        FechaEntrega: today,
        Importe: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProyecto(null);
    setFormData({
      Cliente: '',
      Descripcion: '',
      Estado: '',
      FechaCreacion: '',
      FechaEntrega: '',
      Importe: 0
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingProyecto) {
        await directusApi.updateProyecto(editingProyecto.id, formData);
      } else {
        await directusApi.createProyecto(formData);
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error guardando proyecto:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      try {
        await directusApi.deleteProyecto(id);
        refetch();
      } catch (error) {
        console.error('Error eliminando proyecto:', error);
      }
    }
  };

  // 📌 Filtrado por Cliente y Estado
  const proyectosFiltrados = proyectos.filter((p) => {
    const clienteId = typeof p.Cliente === 'object' ? p.Cliente.id.toString() : p.Cliente.toString();
    const estadoId = typeof p.Estado === 'object' ? p.Estado.id.toString() : p.Estado.toString();

    return (
      (filtroCliente ? clienteId === filtroCliente : true) &&
      (filtroEstado ? estadoId === filtroEstado : true)
    );
  });

  const renderModal = () => (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
          <button className="modal-close" onClick={handleCloseModal}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Cliente</label>
            <select
              value={formData.Cliente}
              onChange={(e) => setFormData({...formData, Cliente: e.target.value})}
              className="form-input"
              required
            >
              <option value="">Seleccionar Cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.Nombre} {cliente.Apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.Descripcion}
              onChange={(e) => setFormData({...formData, Descripcion: e.target.value})}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select
              value={formData.Estado}
              onChange={(e) => setFormData({...formData, Estado: e.target.value})}
              className="form-input"
              required
            >
              <option value="">Seleccionar Estado</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.Estado}
                </option>
              ))}
            </select>
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
              <label>Fecha Entrega</label>
              <input
                type="date"
                value={formData.FechaEntrega}
                onChange={(e) => setFormData({...formData, FechaEntrega: e.target.value})}
                className="form-input"
                required
              />
            </div>
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
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingProyecto ? 'Actualizar' : 'Crear'} Proyecto
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="proyectos-container">
      <div className="box">
        <div className="box-header">
          <h2 className="box-title">Proyectos</h2>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Nuevo Proyecto
          </button>
        </div>

        {/* 🔽 Filtros Cliente + Estado */}
        <div className="filters">
          <select
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            className="form-input"
          >
            <option value="">Todos los clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.Nombre} {cliente.Apellido}
              </option>
            ))}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="form-input"
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.Estado}
              </option>
            ))}
          </select>
        </div>

        <div className="box-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Fecha Creación</th>
                  <th>Fecha Entrega</th>
                  <th>Importe</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proyectosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="no-data">No hay proyectos registrados</td>
                  </tr>
                ) : (
                  proyectosFiltrados.map((proyecto) => (
                    <tr key={proyecto.id}>
                      <td>{proyecto.id}</td>
                      <td>
                        {typeof proyecto.Cliente === 'object' 
                          ? `${proyecto.Cliente.Nombre} ${proyecto.Cliente.Apellido}`
                          : `Cliente ID: ${proyecto.Cliente}`
                        }
                      </td>
                      <td>{proyecto.Descripcion}</td>
                      <td>
                        <span className={`badge badge-${typeof proyecto.Estado === 'object' ? proyecto.Estado.Estado.toLowerCase().replace(' ', '-') : 'pendiente'}`}>
                          {typeof proyecto.Estado === 'object' ? proyecto.Estado.Estado : `Estado ID: ${proyecto.Estado}`}
                        </span>
                      </td>
                      <td>{new Date(proyecto.FechaCreacion).toLocaleDateString()}</td>
                      <td>{new Date(proyecto.FechaEntrega).toLocaleDateString()}</td>
                      <td className="currency-positive">{formatCurrency(proyecto.Importe)}</td>
                      <td>
                        <button 
                          className="btn-icon" 
                          title="Editar"
                          onClick={() => handleOpenModal(proyecto)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon btn-danger" 
                          title="Eliminar"
                          onClick={() => handleDelete(proyecto.id)}
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

export default ProyectosList;
