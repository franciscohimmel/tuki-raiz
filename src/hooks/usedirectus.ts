import { useState, useEffect } from 'react';
import { directusApi } from '../services/directus';
import {
  RaizCliente,
  RaizEstado,
  RaizConcepto,
  RaizProyecto,
  RaizIngresos,
  RaizGastos,
  SaldoConsolidado
} from '../types/index';

export const useLogins = () => {
  const [logins, setLogins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogins = async () => {
    try {
      setLoading(true);
      const data = await directusApi.getLogins();
      setLogins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching logins:', error);
      setLogins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, []);

  return { logins, loading, refetch: fetchLogins };
};

export const useClientes = () => {
  const [clientes, setClientes] = useState<RaizCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await directusApi.getClientes();
      setClientes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return { clientes, loading, error, refetch: fetchClientes };
};

export const useProyectos = () => {
  const [proyectos, setProyectos] = useState<RaizProyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const data = await directusApi.getProyectos();
      setProyectos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar proyectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  return { proyectos, loading, error, refetch: fetchProyectos };
};

export const useGastos = () => {
  const [gastos, setGastos] = useState<RaizGastos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGastos = async () => {
    try {
      setLoading(true);
      const data = await directusApi.getGastos();
      setGastos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar gastos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, []);

  return { gastos, loading, error, refetch: fetchGastos };
};

export const useIngresos = () => {
  const [ingresos, setIngresos] = useState<RaizIngresos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngresos = async () => {
    try {
      setLoading(true);
      const data = await directusApi.getIngresos();
      setIngresos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Error al cargar ingresos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngresos();
  }, []);

  return { ingresos, loading, error, refetch: fetchIngresos };
};

export const useEstados = () => {
  const [estados, setEstados] = useState<RaizEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstados = async () => {
    try {
      setLoading(true);
      const data = await directusApi.getEstados();
      setEstados(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Error al cargar estados");
      console.error(err);
      setEstados([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstados();
  }, []);

  return { estados, loading, error, refetch: fetchEstados };
};

export const useConceptos = () => {
  const [conceptos, setConceptos] = useState<RaizConcepto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConceptos = async () => {
    try {
      setLoading(true);
      const data = await directusApi.getConceptos();
      setConceptos(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Error al cargar conceptos");
      console.error(err);
      setConceptos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConceptos();
  }, []);

  return { conceptos, loading, error, refetch: fetchConceptos };
};

// Hook para calcular el dashboard usando la API
export const useDashboard = () => {
  const [saldoConsolidado, setSaldoConsolidado] = useState<SaldoConsolidado>({
    cajaYBancos: 0,
    flujoNeto: 0,
    porCobrar: 0,
    porPagar: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const stats = await directusApi.getDashboardStats();
        setSaldoConsolidado({
          cajaYBancos: stats.cajaYBancos || 0,
          flujoNeto: stats.flujoNeto || 0,
          porCobrar: stats.porCobrar || 0,
          porPagar: stats.porPagar || 0
        });
      } catch (error) {
        console.error('Error calculando dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { saldoConsolidado, loading };
};