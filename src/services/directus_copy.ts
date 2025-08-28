// src/services/directus.ts
const API_BASE = process.env.REACT_APP_DIRECTUS_URL;

export const directusApi = {
  async request(endpoint: string, options?: RequestInit) {
    try {
      console.log(`Fetching: ${API_BASE}/items/${endpoint}`);
      const response = await fetch(`${API_BASE}/items/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      
      const data = await response.json();
      console.log(`Data from ${endpoint}:`, data);
      return data.data || data;
    } catch (error) {
      console.error(`Error en ${endpoint}:`, error);
      return [];
    }
  },

  // Métodos específicos para Raíz Muebles
  async getClientes() {
    return this.request('RaizCliente');
  },

  // Agregar después de getClientes():
  async getUsuarios() {
    return this.request('RaizLogin');
  },

  async getProyectos() {
    // Incluir las relaciones con Estados y Clientes
    return this.request('RaizProyecto?fields=*,Estado.*,Cliente.*');
  },

  async getGastos() {
    // Incluir las relaciones con Proyectos y Conceptos
    return this.request('RaizGastos?fields=*,Proyecto.*,Proyecto.Cliente.*,Concepto.*');
  },

  async getIngresos() {
    // Incluir las relaciones con Proyectos
    return this.request('RaizIngresos?fields=*,Proyecto.*,Proyecto.Cliente.*');
  },

  async getEstados() {
    try {
      const estados = await this.request('RaizEstado');
      console.log('Estados obtenidos:', estados);
      
      // Si hay error o no hay estados, usar valores por defecto
      if (!estados || !Array.isArray(estados) || estados.length === 0) {
        console.warn('No se pudieron obtener estados, usando valores por defecto');
        return [
          { id: 1, Estado: 'En Proceso' },
          { id: 2, Estado: 'Completado' },
          { id: 3, Estado: 'Pendiente' },
          { id: 4, Estado: 'Cancelado' }
        ];
      }
      
      return estados;
    } catch (error) {
      console.error('Error obteniendo estados:', error);
      return [
        { id: 1, Estado: 'En Proceso' },
        { id: 2, Estado: 'Completado' },
        { id: 3, Estado: 'Pendiente' },
        { id: 4, Estado: 'Cancelado' }
      ];
    }
  },

  async getConceptos() {
    try {
      const conceptos = await this.request('RaizConcepto');
      console.log('Conceptos obtenidos:', conceptos);
      
      // Si hay error o no hay conceptos, usar valores por defecto
      if (!conceptos || !Array.isArray(conceptos) || conceptos.length === 0) {
        console.warn('No se pudieron obtener conceptos, usando valores por defecto');
        return [
          { id: 1, Concepto: 'Materiales' },
          { id: 2, Concepto: 'Mano de Obra' },
          { id: 3, Concepto: 'Servicios' },
          { id: 4, Concepto: 'Transporte' }
        ];
      }
      
      return conceptos;
    } catch (error) {
      console.error('Error obteniendo conceptos:', error);
      return [
        { id: 1, Concepto: 'Materiales' },
        { id: 2, Concepto: 'Mano de Obra' },
        { id: 3, Concepto: 'Servicios' },
        { id: 4, Concepto: 'Transporte' }
      ];
    }
  },

  // Estadísticas del dashboard
  async getDashboardStats() {
    try {
      const [clientes, proyectos, gastos, ingresos] = await Promise.all([
        this.getClientes(),
        this.getProyectos(),
        this.getGastos(),
        this.getIngresos()
      ]);

      console.log('Raw data para stats:', { clientes, proyectos, gastos, ingresos });

      const clientesArray = Array.isArray(clientes) ? clientes : [];
      const proyectosArray = Array.isArray(proyectos) ? proyectos : [];
      const gastosArray = Array.isArray(gastos) ? gastos : [];
      const ingresosArray = Array.isArray(ingresos) ? ingresos : [];

      // Calcular saldos
      const totalIngresos = ingresosArray.reduce((sum: number, ing: any) => sum + (ing.Importe || 0), 0);
      const totalGastos = gastosArray.reduce((sum: number, gasto: any) => sum + (gasto.Importe || 0), 0);
      const gastosPagados = gastosArray.filter((g: any) => g.EstadoPago === 'Pagado').reduce((sum: number, g: any) => sum + (g.Importe || 0), 0);
      const gastosPendientes = gastosArray.filter((g: any) => g.EstadoPago === 'Pendiente' || g.EstadoPago === 'Vencido').reduce((sum: number, g: any) => sum + (g.Importe || 0), 0);

      // Calcular por cobrar CORRECTAMENTE (total proyecto - ingresos ya cobrados de ese proyecto)
      const porCobrar = proyectosArray.reduce((sum: number, proyecto: any) => {
        const totalProyecto = proyecto.Importe || 0;
        
        // Sumar todos los ingresos de este proyecto específico
        const ingresosDelProyecto = ingresosArray
          .filter((ingreso: any) => {
            // Comparar con el ID del proyecto (puede ser número o objeto)
            const proyectoId = typeof ingreso.Proyecto === 'object' 
              ? ingreso.Proyecto.id 
              : ingreso.Proyecto;
            return proyectoId === proyecto.id;
          })
          .reduce((suma: number, ingreso: any) => suma + (ingreso.Importe || 0), 0);

        // Lo que falta cobrar de este proyecto
        const faltaCobrar = Math.max(0, totalProyecto - ingresosDelProyecto);
        return sum + faltaCobrar;
      }, 0);

      // Flujo neto proyectado = Por cobrar - Por pagar
      const flujoNetoProyectado = porCobrar - gastosPendientes;

      console.log('Cálculo detallado:');
      console.log('- Total ingresos:', totalIngresos);
      console.log('- Gastos pagados:', gastosPagados);
      console.log('- Gastos pendientes:', gastosPendientes);
      console.log('- Por cobrar calculado:', porCobrar);
      console.log('- Flujo neto proyectado:', flujoNetoProyectado);

      return {
        cajaYBancos: totalIngresos - gastosPagados,
        flujoNeto: flujoNetoProyectado, // Cambiar a proyectado
        porCobrar: porCobrar,
        porPagar: gastosPendientes,
        totalClientes: clientesArray.length,
        proyectosActivos: proyectosArray.filter((p: any) => p.Estado?.Estado !== 'Completado').length,
        totalProyectos: proyectosArray.length
      };
    } catch (error) {
      console.error('Error calculando stats:', error);
      return {
        cajaYBancos: 0,
        flujoNeto: 0,
        porCobrar: 0,
        porPagar: 0,
        totalClientes: 0,
        proyectosActivos: 0,
        totalProyectos: 0
      };
    }
  },

  // CRUD Operations
  async createCliente(cliente: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizCliente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
      });
      const data = await response.json();
      console.log('Cliente creado:', data);
      return data;
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  },

  async updateCliente(id: number, cliente: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizCliente/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente),
      });
      const data = await response.json();
      console.log('Cliente actualizado:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      throw error;
    }
  },

  async deleteCliente(id: number) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizCliente/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Cliente eliminado:', id);
      return response;
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      throw error;
    }
  },

  async createProyecto(proyecto: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizProyecto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proyecto),
      });
      const data = await response.json();
      console.log('Proyecto creado:', data);
      return data;
    } catch (error) {
      console.error('Error creando proyecto:', error);
      throw error;
    }
  },

  async updateProyecto(id: number, proyecto: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizProyecto/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proyecto),
      });
      const data = await response.json();
      console.log('Proyecto actualizado:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando proyecto:', error);
      throw error;
    }
  },

  async deleteProyecto(id: number) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizProyecto/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Proyecto eliminado:', id);
      return response;
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      throw error;
    }
  },

  async createGasto(gasto: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizGastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gasto),
      });
      const data = await response.json();
      console.log('Gasto creado:', data);
      return data;
    } catch (error) {
      console.error('Error creando gasto:', error);
      throw error;
    }
  },

  async updateGasto(id: number, gasto: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizGastos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gasto),
      });
      const data = await response.json();
      console.log('Gasto actualizado:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando gasto:', error);
      throw error;
    }
  },

  async deleteGasto(id: number) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizGastos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Gasto eliminado:', id);
      return response;
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      throw error;
    }
  },

  async createIngreso(ingreso: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizIngresos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingreso),
      });
      const data = await response.json();
      console.log('Ingreso creado:', data);
      return data;
    } catch (error) {
      console.error('Error creando ingreso:', error);
      throw error;
    }
  },

  async updateIngreso(id: number, ingreso: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizIngresos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ingreso),
      });
      const data = await response.json();
      console.log('Ingreso actualizado:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando ingreso:', error);
      throw error;
    }
  },

  async deleteIngreso(id: number) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizIngresos/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Ingreso eliminado:', id);
      return response;
    } catch (error) {
      console.error('Error eliminando ingreso:', error);
      throw error;
    }
  },
  async createEstado(estado: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizEstado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estado),
      });
      const data = await response.json();
      console.log('Estado creado:', data);
      return data;
    } catch (error) {
      console.error('Error creando estado:', error);
      throw error;
    }
  },

  async updateEstado(id: number, estado: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizEstado/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estado),
      });
      const data = await response.json();
      console.log('Estado actualizado:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  },

  async deleteEstado(id: number) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizEstado/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Estado eliminado:', id);
      return response;
    } catch (error) {
      console.error('Error eliminando estado:', error);
      throw error;
    }
  },

  async createConcepto(concepto: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizConcepto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(concepto),
      });
      const data = await response.json();
      console.log('Concepto creado:', data);
      return data;
    } catch (error) {
      console.error('Error creando concepto:', error);
      throw error;
    }
  },

  async updateConcepto(id: number, concepto: any) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizConcepto/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(concepto),
      });
      const data = await response.json();
      console.log('Concepto actualizado:', data);
      return data;
    } catch (error) {
      console.error('Error actualizando concepto:', error);
      throw error;
    }
  },
   async deleteConcepto(id: number) {
    try {
      const response = await fetch(`${API_BASE}/items/RaizConcepto/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Concepto eliminado:', id);
      return response;
    } catch (error) {
      console.error('Error eliminando concepto:', error);
      throw error;
    }
  },

async getLogins() {
  return this.request('RaizLogin');
},

async createLogin(login: any) {
  try {
    const response = await fetch(`${API_BASE}/items/RaizLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(login),
    });
    const data = await response.json();
    console.log('Login creado:', data);
    return data;
  } catch (error) {
    console.error('Error creando login:', error);
    throw error;
  }
},

async updateLogin(id: number, login: any) {
  try {
    // Si no se proporciona contraseña, no la incluimos en la actualización
    if (!login.Password) {
      delete login.Password;
    }
    
    const response = await fetch(`${API_BASE}/items/RaizLogin/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(login),
    });
    const data = await response.json();
    console.log('Login actualizado:', data);
    return data;
  } catch (error) {
    console.error('Error actualizando login:', error);
    throw error;
  }
},

async deleteLogin(id: number) {
  try {
    const response = await fetch(`${API_BASE}/items/RaizLogin/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Login eliminado:', id);
    return response;
  } catch (error) {
    console.error('Error eliminando login:', error);
    throw error;
  }
},
};