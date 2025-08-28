import React, { useState } from 'react';
import { useEstados, useConceptos, useLogins } from '../../hooks/usedirectus';
import { directusApi } from '../../services/directus';
import { Plus, Edit, Trash2, X, Settings, User, Tag, FileText, Eye, EyeOff } from 'lucide-react';
import './Configuracion.css';

const Configuracion: React.FC = () => {
  const { estados, refetch : refetchEstados } = useEstados();
  const { conceptos, refetch: refetchConceptos } = useConceptos();
  const { logins, refetch: refetchLogins } = useLogins();
  
  const [activeTab, setActiveTab] = useState<'estados' | 'conceptos' | 'usuario' | 'accesos'>('estados');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'estado' | 'concepto' | 'login'>('estado');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [estadoForm, setEstadoForm] = useState({ Estado: '' });
  const [conceptoForm, setConceptoForm] = useState({ Concepto: '' });
  const [loginForm, setLoginForm] = useState({
    Nombre: '',
    Password: '',
    Usuario: ''
  });
  
  // Datos ficticios para usuario (deberían venir de la base de datos)
  const [usuarioData, setUsuarioData] = useState({
    nombre: 'Lucia',
    email: 'Lucia@raizmuebles.com',
    telefono: '+54 9 11 1234-5678',
    empresa: 'Raíz Muebles',
    direccion: 'Av. Principal 123, Buenos Aires'
  });

  const handleOpenModal = (type: 'estado' | 'concepto' | 'login', item?: any) => {
    setModalType(type);
    setEditingItem(item);
    setShowPassword(false);
    
    if (type === 'estado') {
      setEstadoForm({ Estado: item ? item.Estado : '' });
    } else if (type === 'concepto') {
      setConceptoForm({ Concepto: item ? item.Concepto : '' });
    } else if (type === 'login') {
      setLoginForm({
        Nombre: item ? item.Nombre : '',
        Password: '', // Siempre vacía para edición
        Usuario: item ? item.Usuario : ''
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setShowPassword(false);
    setEstadoForm({ Estado: '' });
    setConceptoForm({ Concepto: '' });
    setLoginForm({
      Nombre: '',
      Password: '',
      Usuario: ''
    });
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
      } else if (modalType === 'concepto') {
        if (editingItem) {
          await directusApi.updateConcepto(editingItem.id, conceptoForm);
        } else {
          await directusApi.createConcepto(conceptoForm);
        }
        refetchConceptos();
      } else if (modalType === 'login') {
        // Validaciones para login
        if (!loginForm.Usuario.trim()) {
          alert('El campo Usuario es obligatorio');
          return;
        }
        if (!editingItem && !loginForm.Password.trim()) {
          alert('La contraseña es obligatoria para nuevos usuarios');
          return;
        }
        if (!loginForm.Nombre.trim()) {
          alert('El campo Nombre es obligatorio');
          return;
        }

        if (editingItem) {
          await directusApi.updateLogin(editingItem.id, loginForm);
        } else {
          await directusApi.createLogin(loginForm);
        }
        refetchLogins();
      }
      handleCloseModal();
    } catch (error) {
      console.error(`Error guardando ${modalType}:`, error);
      if (modalType === 'login') {
        alert(`Error guardando usuario de acceso. Por favor intenta nuevamente.`);
      }
    }
  };

  const handleDelete = async (type: 'estado' | 'concepto' | 'login', id: number) => {
    const itemName = type === 'estado' ? 'estado' : type === 'concepto' ? 'concepto' : 'usuario de acceso';
    if (window.confirm(`¿Estás seguro de que deseas eliminar este ${itemName}?`)) {
      try {
        if (type === 'estado') {
          await directusApi.deleteEstado(id);
          refetchEstados();
        } else if (type === 'concepto') {
          await directusApi.deleteConcepto(id);
          refetchConceptos();
        } else if (type === 'login') {
          await directusApi.deleteLogin(id);
          refetchLogins();
        }
      } catch (error) {
        console.error(`Error eliminando ${itemName}:`, error);
        if (type === 'login') {
          alert(`Error eliminando usuario de acceso. Por favor intenta nuevamente.`);
        }
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

  const renderAccesosTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h3>Usuarios de Acceso al Sistema</h3>
        <button className="btn btn-primary" onClick={() => handleOpenModal('login')}>
          <Plus size={16} />
          Nuevo Usuario de Acceso
        </button>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {logins.length === 0 ? (
              <tr>
                <td colSpan={4} className="no-data">No hay usuarios de acceso registrados</td>
              </tr>
            ) : (
              logins.map((login) => (
                <tr key={login.id}>
                  <td>{login.id}</td>
                  <td>{login.Usuario}</td>
                  <td>{login.Nombre}</td>
                  <td>
                    <button 
                      className="btn-icon" 
                      title="Editar"
                      onClick={() => handleOpenModal('login', login)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon btn-danger" 
                      title="Eliminar"
                      onClick={() => handleDelete('login', login.id)}
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

  const renderModal = () => (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {editingItem 
              ? `Editar ${modalType === 'estado' ? 'Estado' : modalType === 'concepto' ? 'Concepto' : 'Usuario de Acceso'}` 
              : `Nuevo ${modalType === 'estado' ? 'Estado' : modalType === 'concepto' ? 'Concepto' : 'Usuario de Acceso'}`
            }
          </h2>
          <button className="modal-close" onClick={handleCloseModal}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {modalType === 'estado' && (
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
          )}

          {modalType === 'concepto' && (
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

          {modalType === 'login' && (
            <div className="login-form">
              <div className="form-group">
                <label>Usuario *</label>
                <input
                  type="text"
                  value={loginForm.Usuario}
                  onChange={(e) => setLoginForm({...loginForm, Usuario: e.target.value})}
                  className="form-input"
                  placeholder="Nombre de usuario"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={loginForm.Nombre}
                  onChange={(e) => setLoginForm({...loginForm, Nombre: e.target.value})}
                  className="form-input"
                  placeholder="Nombre completo"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Contraseña {editingItem ? '(dejar vacío para mantener actual)' : '*'}</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginForm.Password}
                    onChange={(e) => setLoginForm({...loginForm, Password: e.target.value})}
                    className="form-input"
                    placeholder={editingItem ? "Nueva contraseña" : "Contraseña"}
                    required={!editingItem}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
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
          <button 
            className={`config-tab ${activeTab === 'accesos' ? 'active' : ''}`}
            onClick={() => setActiveTab('accesos')}
          >
            <User size={16} />
            Accesos
          </button>
        </div>

        <div className="box-content">
          {activeTab === 'estados' && renderEstadosTab()}
          {activeTab === 'conceptos' && renderConceptosTab()}
          {activeTab === 'usuario' && renderUsuarioTab()}
          {activeTab === 'accesos' && renderAccesosTab()}
        </div>
      </div>

      {showModal && renderModal()}
    </div>
  );
};

export default Configuracion;