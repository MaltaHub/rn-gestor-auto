/**
 * Tipos de domínio - representam as entidades de negócio
 * Separados dos tipos de API para maior flexibilidade
 */

// Branded types para IDs específicos
export type VeiculoId = string & { readonly brand: unique symbol };
export type EmpresaId = string & { readonly brand: unique symbol };
export type LojaId = string & { readonly brand: unique symbol };
export type AnuncioId = string & { readonly brand: unique symbol };
export type UsuarioId = string & { readonly brand: unique symbol };

// Enums de domínio
export enum EstadoVeiculo {
  NOVO = 'novo',
  SEMINOVO = 'seminovo',
  USADO = 'usado',
  SUCATA = 'sucata',
  LIMPO = 'limpo',
  SUJO = 'sujo'
}

export enum EstadoVenda {
  DISPONIVEL = 'disponivel',
  RESERVADO = 'reservado',
  VENDIDO = 'vendido',
  REPASSADO = 'repassado',
  RESTRITO = 'restrito'
}

export enum PapelUsuario {
  PROPRIETARIO = 'proprietario',
  ADMINISTRADOR = 'administrador',
  GERENTE = 'gerente',
  USUARIO = 'usuario'
}

export enum TipoCombustivel {
  GASOLINA = 'gasolina',
  ALCOOL = 'alcool',
  FLEX = 'flex',
  DIESEL = 'diesel',
  ELETRICO = 'eletrico',
  HIBRIDO = 'hibrido'
}

export enum TipoCambio {
  MANUAL = 'manual',
  AUTOMATICO = 'automatico',
  CVT = 'cvt',
  OUTRO = 'outro'
}

export enum TipoCarroceria {
  SEDAN = 'sedan',
  HATCH = 'hatch',
  CAMIONETA = 'camioneta',
  SUV = 'suv',
  SUV_COMPACTO = 'suv compacto',
  SUV_MEDIO = 'suv medio',
  VAN = 'van',
  BUGGY = 'buggy'
}

// Entidades de domínio
export interface Empresa {
  id: EmpresaId;
  nome: string;
  dominio?: string;
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Loja {
  id: LojaId;
  empresaId: EmpresaId;
  nome: string;
}

export interface Modelo {
  id: string;
  empresaId: EmpresaId;
  marca: string;
  nome: string;
  edicao?: string;
  carroceria?: TipoCarroceria;
  combustivel?: TipoCombustivel;
  tipoCambio?: TipoCambio;
  motor?: string;
  cambio?: string;
  cilindros?: number;
  valvulas?: number;
  lugares?: number;
  portas?: number;
  cabine?: string;
  tracao?: string;
  anoInicial?: number;
  anoFinal?: number;
}

export interface Veiculo {
  id: VeiculoId;
  empresaId: EmpresaId;
  modeloId: string;
  placa: string;
  chassi?: string;
  cor: string;
  anoModelo?: number;
  anoFabricacao?: number;
  hodometro?: number;
  estadoVeiculo: EstadoVeiculo;
  estadoVenda: EstadoVenda;
  precoVenda?: number;
  observacao?: string;
  registradoEm: Date;
  editadoEm: Date;
  modelo?: Modelo;
  caracteristicas?: Caracteristica[];
}

export interface VeiculoLoja {
  id: string;
  veiculoId: VeiculoId;
  lojaId: LojaId;
  empresaId: EmpresaId;
  preco?: number;
  pastaFotos?: string;
  veiculo: Veiculo;
  loja: Loja;
}

export interface Anuncio {
  id: AnuncioId;
  empresaId: EmpresaId;
  veiculoLojaId?: string;
  plataformaId: string;
  titulo: string;
  descricao?: string;
  preco?: number;
  tipoAnuncio: 'repetido' | 'unico';
  status: 'ativo' | 'pausado' | 'inativo';
  visualizacoes?: number;
  favoritos?: number;
  mensagens?: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Caracteristica {
  id: string;
  empresaId: EmpresaId;
  nome: string;
}

export interface Plataforma {
  id: string;
  empresaId: EmpresaId;
  nome: string;
}

export interface MembroEmpresa {
  id: string;
  empresaId: EmpresaId;
  usuarioId: UsuarioId;
  papel: PapelUsuario;
  ativo: boolean;
  criadoEm: Date;
}

// Tipos para estatísticas e dashboards
export interface EstatisticasVeiculos {
  total: number;
  disponiveis: number;
  vendidos: number;
  reservados: number;
}

export interface EstatisticasAnuncios {
  ativos: number;
  visualizacoes: number;
  favoritos: number;
  mensagens: number;
}