// Tipos para las tablas de Directus

export interface RaizCliente {
  id: number;
  Nombre: string;
  Apellido: string;
  Direccion: string;
  telefono: string;
  Email: string;
}

export interface RaizEstado {
  id: number;
  Estado: string;
}

export interface RaizConcepto {
  id: number;
  Concepto: string;
}

export interface RaizProyecto {
  id: number;
  Cliente: RaizCliente | number;
  Descripcion: string;
  Estado: RaizEstado | number;
  FechaCreacion: string;
  FechaEntrega: string;
  Importe: number;
}

export interface RaizIngresos {
  id: number;
  Proyecto: RaizProyecto | number;
  FechaPago: string;
  Importe: number;
  MetodoPago: string;
}

export interface RaizGastos {
  id: number;
  Proyecto: RaizProyecto | number;
  Concepto: RaizConcepto | number;
  FechaCreacion: string;
  Importe: number;
  MetodoPago: string;
  NumeroCheque?: string;
  BancoEmisor?: string;
  ChequeFechaVencimiento?: string;
  EstadoPago: string;
  FechaPago?: string;
}

// Tipos para el dashboard
export interface SaldoConsolidado {
  cajaYBancos: number;
  flujoNeto: number;
  porCobrar: number;
  porPagar: number;
}

export interface ConceptoCalendario {
  descripcion: string;
  proyecto: string;
  monto: number;
  fecha: string;
  tipo: 'cobrar' | 'pagar';
  venceHoy?: boolean;
}

export interface FechaGrupo {
  fecha: string;
  conceptos: ConceptoCalendario[];
}