import React, { useState } from 'react';
import { useDashboard, useGastos, useIngresos, useProyectos } from '../../hooks/usedirectus';
import { Plus, DollarSign, TrendingUp, AlertCircle, Menu } from 'lucide-react';
import ClientesList from '../Clientes/ClientesList';
import ProyectosList from '../Proyectos/ProyectosList';
import GastosList from '../Gastos/GastosList';
import IngresosList from '../Ingresos/IngresosList';
import Configuracion from '../Configuracion/Configuracion';
import './Dashboard.css';


interface DashboardProps {
  user?: any;
  onLogout?: () => void;
}

  const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { saldoConsolidado, loading: dashboardLoading } = useDashboard();
  const { gastos, refetch: refetchGastos } = useGastos();
  const { ingresos, refetch: refetchIngresos } = useIngresos();
  const { proyectos } = useProyectos();
  const [openMenu, setOpenMenu] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'clientes' | 'proyectos' | 'gastos' | 'ingresos' | 'configuracion'>('home');
  const [filtroGastos, setFiltroGastos] = useState<string>('todos');
    
  const refreshDashboard = () => {
    refetchGastos();
    refetchIngresos();
    window.location.reload();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const gastosVencenHoy = gastos.filter(gasto => {
    if (gasto.ChequeFechaVencimiento) {
      const hoy = new Date().toISOString().split('T')[0];
      const fechaVencimiento = new Date(gasto.ChequeFechaVencimiento).toISOString().split('T')[0];
      return fechaVencimiento <= hoy && gasto.EstadoPago === 'Pendiente';
    }
    return false;
  });

  // Agregar esta función después de formatCurrency:
const getProyectosPendientesCobro = () => {
  return proyectos.filter(proyecto => {
    const totalProyecto = proyecto.Importe || 0;
    const ingresosDelProyecto = ingresos
      .filter(ingreso => {
        const proyectoId = typeof ingreso.Proyecto === 'object' 
          ? ingreso.Proyecto.id 
          : ingreso.Proyecto;
        return proyectoId === proyecto.id;
      })
      .reduce((sum, ing) => sum + (ing.Importe || 0), 0);
    
    return totalProyecto > ingresosDelProyecto;
  }).map(proyecto => {
    const totalProyecto = proyecto.Importe || 0;
    const ingresosDelProyecto = ingresos
      .filter(ingreso => {
        const proyectoId = typeof ingreso.Proyecto === 'object' 
          ? ingreso.Proyecto.id 
          : ingreso.Proyecto;
        return proyectoId === proyecto.id;
      })
      .reduce((sum, ing) => sum + (ing.Importe || 0), 0);
    
    return {
      ...proyecto,
      saldoPendiente: totalProyecto - ingresosDelProyecto
    };
  });
};

  const gastosFiltrados = filtroGastos === 'todos' 
    ? gastos 
    : gastos.filter(gasto => gasto.MetodoPago.toLowerCase() === filtroGastos);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-container">
          <div className="breadcrumb">
            <a href="/" aria-label="Volver al inicio">
              <img
                src="/logo.png" // Apunta a 'public/logo.png'
                alt="TUKI"
                style={{ height: '90px', width: 'auto' }} // Añade estilos para controlar el tamaño
              />
            </a>
          </div>
          <div className="header-actions">
            <button 
              className={`btn ${currentView === 'clientes' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('clientes')}
            >
              Clientes
            </button>
            <button 
              className={`btn ${currentView === 'proyectos' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('proyectos')}
            >
              Proyectos
            </button>
            <button 
              className={`btn ${currentView === 'gastos' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('gastos')}
            >
              Gastos
            </button>
            <button 
              className={`btn ${currentView === 'ingresos' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('ingresos')}
            >
              Ingresos
            </button>
            <button 
              className={`btn ${currentView === 'configuracion' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCurrentView('configuracion')}
            >
              ⚙️
            </button>
            {onLogout && (
              <button 
                className="btn btn-secondary" 
                onClick={onLogout}
                title="Cerrar Sesión"
              >
                🔒 {user?.Nombre || 'Usuario'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="dashboard-content">
        {currentView === 'home' && (
          <div className="dashboard-container">
            
            {/* Saldo Consolidado */}
            <div className="saldo-consolidado">
              <div className="saldo-card saldo-card-principal">
                <div className="saldo-card-label">Caja y Bancos Registrados</div>
                <div className="saldo-card-value">{formatCurrency(saldoConsolidado.cajaYBancos)}</div>
                <div className="saldo-card-detail">Saldo según registros manuales de movimientos</div>
              </div>
              
              <div className="saldo-card saldo-card-disponible">
                <div className="saldo-card-label">Flujo Neto Proyectado</div>
                <div className="saldo-card-value">{formatCurrency(saldoConsolidado.flujoNeto)}</div>
                <div className="saldo-card-detail">Por cobrar - Por pagar (próximos 30 días)</div>
              </div>
              
              <div className="saldo-card saldo-card-pendiente-cobrar">
                <div className="saldo-card-label">Por Cobrar (30 días)</div>
                <div className="saldo-card-value">{formatCurrency(saldoConsolidado.porCobrar)}</div>
                <div className="saldo-card-detail">Saldos proyectos + Cheques terceros</div>
              </div>
              
              <div className="saldo-card saldo-card-pendiente-pagar">
                <div className="saldo-card-label">Por Pagar (30 días)</div>
                <div className="saldo-card-value">{formatCurrency(saldoConsolidado.porPagar)}</div>
                <div className="saldo-card-detail">Cheques emitidos + Obligaciones</div>
              </div>
            </div>

            {/* Alerta de vencimientos */}
            {gastosVencenHoy.length > 0 && (
              <div className="alert-vencimiento">
                <AlertCircle size={16} className="alert-icon" />
                <div className="alert-text">
                  <strong>{gastosVencenHoy.length} obligaciones vencen esta semana:</strong>
                  {gastosVencenHoy.slice(0, 3).map((gasto, index) => (
                    <span key={gasto.id}>
                      {typeof gasto.Concepto === 'object' && gasto.Concepto?.Concepto} ({formatCurrency(gasto.Importe)})
                      {index < gastosVencenHoy.length - 1 && index < 2 ? ' • ' : ''}
                    </span>
                  ))}
                  {gastosVencenHoy.length > 3 && ` y ${gastosVencenHoy.length - 3} más...`}
                </div>
              </div>
            )}

            {/* Calendario Financiero */}
            <div className="calendario-grid">
              {/* Por Cobrar */}
              <div className="calendario-box">
                <div className="calendario-header">
                  <h3 className="calendario-title">Por Cobrar (Próximos 60 días)</h3>
                  <div className="calendario-total total-cobrar">{formatCurrency(saldoConsolidado.porCobrar)}</div>
                </div>
                  <div className="calendario-content">
                    <div className="fecha-grupo">
                      <div className="fecha-header">Pendiente de Cobro</div>
                        {(() => {
                          const proyectosPendientes = getProyectosPendientesCobro();
                          return proyectosPendientes.length === 0 ? (
                      <div className="no-data">No hay proyectos pendientes de cobro</div>
                        ) : (
                        proyectosPendientes.slice(0, 5).map((proyecto) => (
                      <div key={proyecto.id} className="concepto-item concepto-cobrar">
                        <div className="concepto-descripcion">
                          <div>Proyecto: {proyecto.Descripcion || `ID: ${proyecto.id}`}</div>
                            <div className="concepto-proyecto">{proyecto.FechaEntrega || 'Sin fecha'}</div>
                          </div>
                            <div className="concepto-monto monto-cobrar">{formatCurrency(proyecto.saldoPendiente)}</div>
                          </div>
                        ))
                        );
                      })()}
                    </div>
                </div>
            </div>

              {/* Por Pagar */}
              <div className="calendario-box">
                <div className="calendario-header">
                  <h3 className="calendario-title">Por Pagar (Próximos 60 días)</h3>
                  <div className="calendario-total total-pagar">{formatCurrency(saldoConsolidado.porPagar)}</div>
                </div>
                <div className="calendario-content">
                  <div className="fecha-grupo">
                    <div className="fecha-header">Pendiente de Pago</div>
                    {gastos.filter(g => g.EstadoPago === 'Pendiente' || g.EstadoPago === 'Vencido').length === 0 ? (
                      <div className="no-data">No hay gastos pendientes</div>
                    ) : (
                      gastos
                        .filter(g => g.EstadoPago === 'Pendiente' || g.EstadoPago === 'Vencido')
                        .slice(0, 5)
                        .map((gasto) => (
                          <div key={gasto.id} className="concepto-item concepto-pagar">
                            <div className="concepto-descripcion">
                              <div>{typeof gasto.Concepto === 'object' ? gasto.Concepto.Concepto : `Concepto ID: ${gasto.Concepto}`}</div>
                              <div className="concepto-proyecto">
                                {gasto.ChequeFechaVencimiento && `Vence: ${new Date(gasto.ChequeFechaVencimiento).toLocaleDateString()}`}
                              </div>
                            </div>
                            <div className="concepto-monto monto-pagar">{formatCurrency(gasto.Importe)}</div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gastos Registrados */}
            <div className="box">
              <div className="box-header">
                <h2 className="box-title">Gastos Registrados</h2>
                <div className="tabs">
                  <button 
                    className={`tab ${filtroGastos === 'todos' ? 'active' : ''}`}
                    onClick={() => setFiltroGastos('todos')}
                  >
                    Todos
                  </button>
                  <button 
                    className={`tab ${filtroGastos === 'efectivo' ? 'active' : ''}`}
                    onClick={() => setFiltroGastos('efectivo')}
                  >
                    Efectivo
                  </button>
                  <button 
                    className={`tab ${filtroGastos === 'transferencia' ? 'active' : ''}`}
                    onClick={() => setFiltroGastos('transferencia')}
                  >
                    Transferencia
                  </button>
                  <button 
                    className={`tab ${filtroGastos === 'cheque' ? 'active' : ''}`}
                    onClick={() => setFiltroGastos('cheque')}
                  >
                    Cheques
                  </button>
                </div>
              </div>
              
              <div className="box-content">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Concepto</th>
                        <th>Método de Pago</th>
                        <th>Fecha Vencimiento</th>
                        <th>Proyecto</th>
                        <th>Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="no-data">No hay gastos registrados</td>
                        </tr>
                      ) : (
                        gastosFiltrados.map((gasto) => (
                          <tr key={gasto.id}>
                            <td>{new Date(gasto.FechaCreacion).toLocaleDateString()}</td>
                            <td>{typeof gasto.Concepto === 'object' ? gasto.Concepto.Concepto : `ID: ${gasto.Concepto}`}</td>
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
                            <td>
                              {typeof gasto.Proyecto === 'object' 
                                ? gasto.Proyecto.Descripcion 
                                : `Proyecto ID: ${gasto.Proyecto}`
                              }
                            </td>
                            <td className="currency-danger">{formatCurrency(gasto.Importe)}</td>
                            <td>
                              <span className={`badge badge-${gasto.EstadoPago.toLowerCase()}`}>
                                {gasto.EstadoPago}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Ingresos Registrados */}
            <div className="box">
              <div className="box-header">
                <h2 className="box-title">Ingresos Registrados</h2>
                <div style={{ fontSize: '14px', color: '#7c98b6' }}>
                  Pagos recibidos de clientes por proyectos
                </div>
              </div>
              
              <div className="box-content">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Proyecto</th>
                        <th>Cliente</th>
                        <th>Concepto</th>
                        <th>Método de Pago</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingresos.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="no-data">No hay ingresos registrados</td>
                        </tr>
                      ) : (
                        ingresos.map((ingreso) => (
                          <tr key={ingreso.id}>
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
                            <td>Pago de Proyecto</td>
                            <td>
                              <span className={`badge badge-${ingreso.MetodoPago.toLowerCase()}`}>
                                {ingreso.MetodoPago}
                              </span>
                            </td>
                            <td className="currency-positive">{formatCurrency(ingreso.Importe)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {currentView === 'clientes' && <ClientesList />}
        {currentView === 'proyectos' && <ProyectosList />}
        {currentView === 'gastos' && <GastosList />}
        {currentView === 'ingresos' && <IngresosList />}
        {currentView === 'configuracion' && <Configuracion />}
      </div>
    </div>
  );
};

export default Dashboard;