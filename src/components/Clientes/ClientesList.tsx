import React, { useState } from 'react';
import { useClientes } from '../../hooks/usedirectus';
import { directusApi } from '../../services/directus';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import './Clientes.css';

const ClientesList: React.FC = () => {
  const { clientes, refetch } = useClientes();

  // 📌 Estado para filtro
  const [filtroApellido, setFiltroApellido] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<any>(null);
  const [formData, setFormData] = useState({
    Nombre: '',
    Apellido: '',
    Direccion: '',
    telefono: '',
    Email: ''
  });

  const handleOpenModal = (cliente?: any) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        Nombre: cliente.Nombre,
        Apellido: cliente.Apellido,
        Direccion: cliente.Direccion,
        telefono: cliente.telefono,
        Email: cliente.Email
      });
    } else {
      setEditingCliente(null);
      setFormData({
        Nombre: '',
        Apellido: '',
        Direccion: '',
        telefono: '',
        Email: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    setFormData({
      Nombre: '',
      Apellido: '',
      Direccion: '',
      telefono: '',
      Email: ''
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingCliente) {
        await directusApi.updateCliente(editingCliente.id, formData);
      } else {
        await directusApi.createCliente(formData);
      }
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error guardando cliente:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await directusApi.deleteCliente(id);
        refetch();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
      }
    }
  };

  // 📌 Filtrado en memoria por apellido
  const clientesFiltrados = filtroApellido
    ? clientes.filter((c) => c.Apellido === filtroApellido)
    : clientes;

  // 📌 Obtener apellidos únicos para el dropdown
  const apellidosUnicos = Array.from(new Set(clientes.map((c) => c.Apellido)));

  return (
    <div className="clientes-container">
      <div className="box">
        <div className="box-header">
          <h2 className="box-title">Clientes</h2>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            Nuevo Cliente
          </button>
        </div>

        {/* 🔽 Dropdown de apellidos */}
        <div className="filters">
          <select
            value={filtroApellido}
            onChange={(e) => setFiltroApellido(e.target.value)}
            className="form-input"
          >
            <option value="">Todos los apellidos</option>
            {apellidosUnicos.map((apellido) => (
              <option key={apellido} value={apellido}>
                {apellido}
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
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">No hay clientes</td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.id}</td>
                      <td>{cliente.Nombre}</td>
                      <td>{cliente.Apellido}</td>
                      <td>{cliente.Email}</td>
                      <td>{cliente.telefono}</td>
                      <td>{cliente.Direccion}</td>
                      <td>
                        <button 
                          className="btn-icon" 
                          title="Editar"
                          onClick={() => handleOpenModal(cliente)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon btn-danger" 
                          title="Eliminar"
                          onClick={() => handleDelete(cliente.id)}
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

      {/* 📌 Modal de creación/edición */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.Nombre}
                  onChange={(e) => setFormData({...formData, Nombre: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  value={formData.Apellido}
                  onChange={(e) => setFormData({...formData, Apellido: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({...formData, Email: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  type="text"
                  value={formData.Direccion}
                  onChange={(e) => setFormData({...formData, Direccion: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingCliente ? 'Actualizar' : 'Crear'} Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesList;
