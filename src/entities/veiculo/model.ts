import { Veiculo, VeiculoId, EstadoVeiculo, EstadoVenda } from '../../shared/types/domain';

/**
 * Modelo de domínio para Veículo
 * Contém a lógica de negócio e validações
 */
export class VeiculoModel {
  constructor(private veiculo: Veiculo) {}

  /**
   * Getters para propriedades do veículo
   */
  get id(): VeiculoId {
    return this.veiculo.id;
  }

  get placa(): string {
    return this.veiculo.placa;
  }

  get cor(): string {
    return this.veiculo.cor;
  }

  get estadoVeiculo(): EstadoVeiculo {
    return this.veiculo.estadoVeiculo;
  }

  get estadoVenda(): EstadoVenda {
    return this.veiculo.estadoVenda;
  }

  get precoVenda(): number | undefined {
    return this.veiculo.precoVenda;
  }

  get modelo(): any {
    return this.veiculo.modelo;
  }

  get anoModelo(): number | undefined {
    return this.veiculo.anoModelo;
  }

  get hodometro(): number | undefined {
    return this.veiculo.hodometro;
  }

  /**
   * Métodos de negócio
   */

  /**
   * Verifica se o veículo está disponível para venda
   */
  isDisponivelParaVenda(): boolean {
    return this.veiculo.estadoVenda === EstadoVenda.DISPONIVEL;
  }

  /**
   * Verifica se o veículo está vendido
   */
  isVendido(): boolean {
    return this.veiculo.estadoVenda === EstadoVenda.VENDIDO;
  }

  /**
   * Verifica se o veículo está reservado
   */
  isReservado(): boolean {
    return this.veiculo.estadoVenda === EstadoVenda.RESERVADO;
  }

  /**
   * Verifica se o veículo precisa de limpeza
   */
  precisaLimpeza(): boolean {
    return this.veiculo.estadoVeiculo === EstadoVeiculo.SUJO;
  }

  /**
   * Calcula a idade do veículo em anos
   */
  getIdadeVeiculo(): number {
    if (!this.veiculo.anoModelo) return 0;
    return new Date().getFullYear() - this.veiculo.anoModelo;
  }

  /**
   * Formata o nome completo do veículo
   */
  getNomeCompleto(): string {
    const modelo = this.veiculo.modelo;
    if (!modelo) return this.veiculo.placa;
    
    const partes = [modelo.marca, modelo.nome];
    if (modelo.edicao) partes.push(modelo.edicao);
    if (this.veiculo.anoModelo) partes.push(this.veiculo.anoModelo.toString());
    
    return partes.join(' ');
  }

  /**
   * Formata o preço de venda
   */
  getPrecoFormatado(): string {
    if (!this.veiculo.precoVenda) return 'Preço não informado';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.veiculo.precoVenda);
  }

  /**
   * Formata a quilometragem
   */
  getHodometroFormatado(): string {
    if (!this.veiculo.hodometro) return 'Não informado';
    
    return new Intl.NumberFormat('pt-BR').format(this.veiculo.hodometro) + ' km';
  }

  /**
   * Retorna a cor do badge baseado no estado de venda
   */
  getCorBadgeEstadoVenda(): 'success' | 'warning' | 'destructive' | 'secondary' {
    switch (this.veiculo.estadoVenda) {
      case EstadoVenda.DISPONIVEL:
        return 'success';
      case EstadoVenda.RESERVADO:
        return 'warning';
      case EstadoVenda.VENDIDO:
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  /**
   * Retorna o texto do estado de venda formatado
   */
  getEstadoVendaFormatado(): string {
    const estados = {
      [EstadoVenda.DISPONIVEL]: 'Disponível',
      [EstadoVenda.RESERVADO]: 'Reservado',
      [EstadoVenda.VENDIDO]: 'Vendido',
      [EstadoVenda.REPASSADO]: 'Repassado',
      [EstadoVenda.RESTRITO]: 'Restrito'
    };
    
    return estados[this.veiculo.estadoVenda] || this.veiculo.estadoVenda;
  }

  /**
   * Retorna o texto do estado do veículo formatado
   */
  getEstadoVeiculoFormatado(): string {
    const estados = {
      [EstadoVeiculo.NOVO]: 'Novo',
      [EstadoVeiculo.SEMINOVO]: 'Seminovo',
      [EstadoVeiculo.USADO]: 'Usado',
      [EstadoVeiculo.SUCATA]: 'Sucata',
      [EstadoVeiculo.LIMPO]: 'Limpo',
      [EstadoVeiculo.SUJO]: 'Sujo'
    };
    
    return estados[this.veiculo.estadoVeiculo] || this.veiculo.estadoVeiculo;
  }

  /**
   * Valida se os dados do veículo estão completos para venda
   */
  isValidoParaVenda(): { valido: boolean; erros: string[] } {
    const erros: string[] = [];
    
    if (!this.veiculo.precoVenda || this.veiculo.precoVenda <= 0) {
      erros.push('Preço de venda deve ser informado');
    }
    
    if (!this.veiculo.modelo) {
      erros.push('Modelo deve ser informado');
    }
    
    if (!this.veiculo.cor.trim()) {
      erros.push('Cor deve ser informada');
    }
    
    if (this.veiculo.estadoVeiculo === EstadoVeiculo.SUCATA) {
      erros.push('Veículo em estado de sucata não pode ser vendido');
    }
    
    return {
      valido: erros.length === 0,
      erros
    };
  }

  /**
   * Retorna os dados brutos do veículo
   */
  toJSON(): Veiculo {
    return { ...this.veiculo };
  }

  /**
   * Cria uma nova instância com dados atualizados
   */
  update(updates: Partial<Veiculo>): VeiculoModel {
    return new VeiculoModel({
      ...this.veiculo,
      ...updates,
      editadoEm: new Date()
    });
  }
}

/**
 * Factory para criar instâncias do modelo
 */
export const createVeiculoModel = (veiculo: Veiculo): VeiculoModel => {
  return new VeiculoModel(veiculo);
};