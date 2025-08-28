import React, { useState } from 'react';
import { useEstados, useConceptos } from '../../hooks/usedirectus';
import { directusApi } from '../../services/directus';
import { Plus, Edit, Trash2, X, Settings, User, Tag, FileText } from 'lucide-react';
import './Configuracion.css';

const Configuracion: React.FC = () => {
  const { estados, refetch : refetchEstados } = useEstados();
  const { conceptos, refetch: refetchConceptos } = useConceptos();
  
  const [activeTab, setActiveTab] = useState<'estados' | 'conceptos' | 'usuario'>('estados');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'estado' | 'concepto'>('estado');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [estadoForm, setEstadoForm] = useState({ Estado: '' });
  const [conceptoForm, setConceptoForm] = useState({ Concepto: '' });
  
  // Datos ficticios para usuario (deberían venir de la base de datos)
  const [usuarioData, setUsuarioData] = useState({
    nombre: 'Lucia',
    email: 'Lucia@raizmuebles.com',
    telefono: '+54 9 11 1234-5678',
    empresa: 'Raíz Muebles',
    direccion: 'Av. Principal 123, Buenos Aires'
  });

  const handleOpenModal = (type: 'estado' | 'concepto', item?: any) => {
    setModalType(type);
    setEditingItem(item);
    
    if (type === 'estado') {
      setEstadoForm({ Estado: item ? item.Estado : '' });
    } else {
      setConceptoForm({ Concepto: item ? item.Concepto : '' });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setEstadoForm({ Estado: '' });
    setConceptoForm({ Concepto: '' });
  };

  const handleSubmit = async () => {
    try {
      if (modalType === 'estado') {
        if (editingItem) {
          await directusApi.updateEstado(editingItem.id, estadoForm);
        } else {
          await directusApi.createEstado(estadoForm);
        }
        refetchEstados();
      } else {
        if (editingItem) {
          await directusApi.updateConcepto(editingItem.id, conceptoForm);
        } else {
          await directusApi.createConcepto(conceptoForm);
        }
        refetchConceptos();
      }
      handleCloseModal();
    } catch (error) {
      console.error(`Error guardando ${modalType}:`, error);
    }
  };

  const handleDelete = async (type: 'estado' | 'concepto', id: number) => {
    const itemName = type === 'estado' ? 'estado' : 'concepto';
    if (window.confirm(`¿Estás seguro de que deseas eliminar este ${itemName}?`)) {
      try {
        if (type === 'estado') {
          await directusApi.deleteEstado(id);
          refetchEstados();
        } else {
          await directusApi.deleteConcepto(id);
          refetchConceptos();
        }
      } catch (error) {
        console.error(`Error eliminando ${itemName}:`, error);
      }
    }
  };

  const renderEstadosTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h3>Estados de Proyectos</h3>
        <button className="btn btn-primary" onClick={() => handleOpenModal('estado')}>
          <Plus size={16} />
          Nuevo Estado
        </button>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estados.length === 0 ? (
              <tr>
                <td colSpan={3} className="no-data">No hay estados registrados</td>
              </tr>
            ) : (
              estados.map((estado) => (
                <tr key={estado.id}>
                  <td>{estado.id}</td>
                  <td>{estado.Estado}</td>
                  <td>
                    <button 
                      className="btn-icon" 
                      title="Editar"
                      onClick={() => handleOpenModal('estado', estado)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Eliminar"
                      onClick={() => handleDelete('estado', estado.id)}
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
  );

  const renderConceptosTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h3>Conceptos de Gastos</h3>
        <button className="btn btn-primary" onClick={() => handleOpenModal('concepto')}>
          <Plus size={16} />
          Nuevo Concepto
        </button>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Concepto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conceptos.length === 0 ? (
              <tr>
                <td colSpan={3} className="no-data">No hay conceptos registrados</td>
              </tr>
            ) : (
              conceptos.map((concepto) => (
                <tr key={concepto.id}>
                  <td>{concepto.id}</td>
                  <td>{concepto.Concepto}</td>
                  <td>
                    <button 
                      className="btn-icon" 
                      title="Editar"
                      onClick={() => handleOpenModal('concepto', concepto)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Eliminar"
                      onClick={() => handleDelete('concepto', concepto.id)}
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
  );

  const renderUsuarioTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h3>Datos del Usuario</h3>
      </div>
      <div className="usuario-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={usuarioData.nombre}
              onChange={(e) => setUsuarioData({...usuarioData, nombre: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={usuarioData.email}
              onChange={(e) => setUsuarioData({...usuarioData, email: e.target.value})}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={usuarioData.telefono}
              onChange={(e) => setUsuarioData({...usuarioData, telefono: e.target.value})}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Empresa</label>
            <input
              type="text"
              value={usuarioData.empresa}
              onChange={(e) => setUsuarioData({...usuarioData, empresa: e.target.value})}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Dirección</label>
          <input
            type="text"
            value={usuarioData.direccion}
            onChange={(e) => setUsuarioData({...usuarioData, direccion: e.target.value})}
            className="form-input"
          />
        </div>
        
        <div className="form-actions">
          <button className="btn btn-primary">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );

  const renderModal = () => (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {editingItem 
              ? `Editar ${modalType === 'estado' ? 'Estado' : 'Concepto'}` 
              : `Nuevo ${modalType === 'estado' ? 'Estado' : 'Concepto'}`
            }
          </h2>
          <button className="modal-close" onClick={handleCloseModal}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {modalType === 'estado' ? (
            <div className="form-group">
              <label>Estado</label>
              <input
                type="text"
                value={estadoForm.Estado}
                onChange={(e) => setEstadoForm({Estado: e.target.value})}
                className="form-input"
                placeholder="Ej: En Proceso, Completado, Pendiente..."
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Concepto</label>
              <input
                type="text"
                value={conceptoForm.Concepto}
                onChange={(e) => setConceptoForm({Concepto: e.target.value})}
                className="form-input"
                placeholder="Ej: Materiales, Mano de Obra, Servicios..."
                required
              />
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingItem ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="configuracion-container">
      <div className="box">
        <div className="box-header">
          <div className="config-header">
            <Settings size={24} />
            <h2 className="box-title">Configuración</h2>
          </div>
        </div>
        
        <div className="config-tabs">
          <button 
            className={`config-tab ${activeTab === 'estados' ? 'active' : ''}`}
            onClick={() => setActiveTab('estados')}
          >
            <Tag size={16} />
            Estados
          </button>
          <button 
            className={`config-tab ${activeTab === 'conceptos' ? 'active' : ''}`}
            onClick={() => setActiveTab('conceptos')}
          >
            <FileText size={16} />
            Conceptos
          </button>
          <button 
            className={`config-tab ${activeTab === 'usuario' ? 'active' : ''}`}
            onClick={() => setActiveTab('usuario')}
          >
            <User size={16} />
            Usuario
          </button>
        </div>

        <div className="box-content">
          {activeTab === 'estados' && renderEstadosTab()}
          {activeTab === 'conceptos' && renderConceptosTab()}
          {activeTab === 'usuario' && renderUsuarioTab()}
        </div>
      </div>

      {showModal && renderModal()}
    </div>
  );
};

export default Configuracion;