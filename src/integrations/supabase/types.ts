export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      anuncios: {
        Row: {
          autor_id: string | null
          created_at: string
          data_publicacao: string | null
          data_vencimento: string | null
          descricao: string | null
          descricao_original: string | null
          favoritos: number | null
          id: string
          id_fisico: string | null
          link_anuncio: string | null
          mensagens: number | null
          plataforma_id: string
          preco: number | null
          preco_original: number | null
          repetido_id: string | null
          status: string
          tenant_id: string
          tipo_anuncio: string
          tipo_id_fisico: string | null
          titulo: string
          titulo_original: string | null
          updated_at: string
          veiculo_loja_id: string | null
          visualizacoes: number | null
        }
        Insert: {
          autor_id?: string | null
          created_at?: string
          data_publicacao?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          descricao_original?: string | null
          favoritos?: number | null
          id?: string
          id_fisico?: string | null
          link_anuncio?: string | null
          mensagens?: number | null
          plataforma_id: string
          preco?: number | null
          preco_original?: number | null
          repetido_id?: string | null
          status?: string
          tenant_id: string
          tipo_anuncio: string
          tipo_id_fisico?: string | null
          titulo: string
          titulo_original?: string | null
          updated_at?: string
          veiculo_loja_id?: string | null
          visualizacoes?: number | null
        }
        Update: {
          autor_id?: string | null
          created_at?: string
          data_publicacao?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          descricao_original?: string | null
          favoritos?: number | null
          id?: string
          id_fisico?: string | null
          link_anuncio?: string | null
          mensagens?: number | null
          plataforma_id?: string
          preco?: number | null
          preco_original?: number | null
          repetido_id?: string | null
          status?: string
          tenant_id?: string
          tipo_anuncio?: string
          tipo_id_fisico?: string | null
          titulo?: string
          titulo_original?: string | null
          updated_at?: string
          veiculo_loja_id?: string | null
          visualizacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anuncios_plataforma_id_fkey"
            columns: ["plataforma_id"]
            isOneToOne: false
            referencedRelation: "plataforma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anuncios_repetido_id_fkey"
            columns: ["repetido_id"]
            isOneToOne: false
            referencedRelation: "repetidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anuncios_veiculo_loja_id_fkey"
            columns: ["veiculo_loja_id"]
            isOneToOne: false
            referencedRelation: "veiculos_loja"
            referencedColumns: ["id"]
          },
        ]
      }
      caracteristicas: {
        Row: {
          id: string
          nome: string
        }
        Insert: {
          id?: string
          nome: string
        }
        Update: {
          id?: string
          nome?: string
        }
        Relationships: []
      }
      caracteristicas_repetidos: {
        Row: {
          caracteristica_id: string
          repetido_id: string
          tenant_id: string
        }
        Insert: {
          caracteristica_id: string
          repetido_id: string
          tenant_id: string
        }
        Update: {
          caracteristica_id?: string
          repetido_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caracteristicas_repetidos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caracteristicas_veiculos_caracteristica_id_fkey"
            columns: ["caracteristica_id"]
            isOneToOne: false
            referencedRelation: "caracteristicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caracteristicas_veiculos_veiculo_id_fkey"
            columns: ["repetido_id"]
            isOneToOne: false
            referencedRelation: "repetidos"
            referencedColumns: ["id"]
          },
        ]
      }
      caracteristicas_veiculos: {
        Row: {
          caracteristica_id: string
          tenant_id: string
          veiculo_id: string
        }
        Insert: {
          caracteristica_id: string
          tenant_id: string
          veiculo_id: string
        }
        Update: {
          caracteristica_id?: string
          tenant_id?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caracteristicas_veiculos_caracteristica_id_fkey"
            columns: ["caracteristica_id"]
            isOneToOne: false
            referencedRelation: "caracteristicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caracteristicas_veiculos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caracteristicas_veiculos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caracteristicas_veiculos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "view_veiculos_expandidos"
            referencedColumns: ["id"]
          },
        ]
      }
      locais: {
        Row: {
          id: string
          nome: string
          tenant_id: string
        }
        Insert: {
          id?: string
          nome: string
          tenant_id: string
        }
        Update: {
          id?: string
          nome?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          id: string
          nome: string
          tenant_id: string
        }
        Insert: {
          id?: string
          nome: string
          tenant_id: string
        }
        Update: {
          id?: string
          nome?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lojas_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lojas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      modelo: {
        Row: {
          cabine: string | null
          cambio: string | null
          carroceria: Database["public"]["Enums"]["tipo_carroceria"]
          cilindros: number | null
          combustivel: Database["public"]["Enums"]["tipo_combustivel"]
          edicao: string | null
          id: string
          lugares: number | null
          marca: string
          motor: string | null
          nome: string
          portas: number | null
          tenant_id: string
          tipo_cambio: Database["public"]["Enums"]["tipo_cambio"]
          tracao: string | null
          valvulas: number | null
        }
        Insert: {
          cabine?: string | null
          cambio?: string | null
          carroceria: Database["public"]["Enums"]["tipo_carroceria"]
          cilindros?: number | null
          combustivel: Database["public"]["Enums"]["tipo_combustivel"]
          edicao?: string | null
          id?: string
          lugares?: number | null
          marca: string
          motor?: string | null
          nome: string
          portas?: number | null
          tenant_id: string
          tipo_cambio: Database["public"]["Enums"]["tipo_cambio"]
          tracao?: string | null
          valvulas?: number | null
        }
        Update: {
          cabine?: string | null
          cambio?: string | null
          carroceria?: Database["public"]["Enums"]["tipo_carroceria"]
          cilindros?: number | null
          combustivel?: Database["public"]["Enums"]["tipo_combustivel"]
          edicao?: string | null
          id?: string
          lugares?: number | null
          marca?: string
          motor?: string | null
          nome?: string
          portas?: number | null
          tenant_id?: string
          tipo_cambio?: Database["public"]["Enums"]["tipo_cambio"]
          tracao?: string | null
          valvulas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modelo_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plataforma: {
        Row: {
          id: string
          nome: string
          tenant_id: string
        }
        Insert: {
          id?: string
          nome: string
          tenant_id: string
        }
        Update: {
          id?: string
          nome?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plataforma_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      repetidos: {
        Row: {
          ano_fabricacao_padrao: number
          ano_modelo_padrao: number
          cor_padrao: string
          id: string
          max_hodometro: number
          min_hodometro: number
          modelo_id: string
          pasta_fotos: string | null
          registrado_em: string | null
          tenant_id: string
        }
        Insert: {
          ano_fabricacao_padrao: number
          ano_modelo_padrao: number
          cor_padrao: string
          id?: string
          max_hodometro: number
          min_hodometro: number
          modelo_id: string
          pasta_fotos?: string | null
          registrado_em?: string | null
          tenant_id: string
        }
        Update: {
          ano_fabricacao_padrao?: number
          ano_modelo_padrao?: number
          cor_padrao?: string
          id?: string
          max_hodometro?: number
          min_hodometro?: number
          modelo_id?: string
          pasta_fotos?: string | null
          registrado_em?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repetidos_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "modelo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repetidos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invites: {
        Row: {
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          invited_by_user_id: string
          invited_user_id: string
          status: string
          tenant_id: string
          token: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invited_by_user_id: string
          invited_user_id: string
          status?: string
          tenant_id: string
          token?: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          invited_by_user_id?: string
          invited_user_id?: string
          status?: string
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          role: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["tenant_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          ativo: boolean
          created_at: string
          dominio: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          dominio?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          dominio?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuario: {
        Row: {
          email: string
          id: string
          nome: string
          registrado_em: string | null
        }
        Insert: {
          email: string
          id?: string
          nome: string
          registrado_em?: string | null
        }
        Update: {
          email?: string
          id?: string
          nome?: string
          registrado_em?: string | null
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano_fabricacao: number | null
          ano_modelo: number | null
          chassi: string | null
          cor: string
          editado_em: string | null
          editado_por: string | null
          estado_veiculo: Database["public"]["Enums"]["estado_veiculo"] | null
          estado_venda: Database["public"]["Enums"]["estado_venda"]
          estagio_documentacao: string | null
          hodometro: number
          id: string
          local: string | null
          modelo_id: string | null
          observacao: string | null
          placa: string
          preco_venda: number | null
          registrado_em: string | null
          registrado_por: string | null
          repetido_id: string | null
          tenant_id: string
        }
        Insert: {
          ano_fabricacao?: number | null
          ano_modelo?: number | null
          chassi?: string | null
          cor: string
          editado_em?: string | null
          editado_por?: string | null
          estado_veiculo?: Database["public"]["Enums"]["estado_veiculo"] | null
          estado_venda: Database["public"]["Enums"]["estado_venda"]
          estagio_documentacao?: string | null
          hodometro: number
          id?: string
          local?: string | null
          modelo_id?: string | null
          observacao?: string | null
          placa: string
          preco_venda?: number | null
          registrado_em?: string | null
          registrado_por?: string | null
          repetido_id?: string | null
          tenant_id: string
        }
        Update: {
          ano_fabricacao?: number | null
          ano_modelo?: number | null
          chassi?: string | null
          cor?: string
          editado_em?: string | null
          editado_por?: string | null
          estado_veiculo?: Database["public"]["Enums"]["estado_veiculo"] | null
          estado_venda?: Database["public"]["Enums"]["estado_venda"]
          estagio_documentacao?: string | null
          hodometro?: number
          id?: string
          local?: string | null
          modelo_id?: string | null
          observacao?: string | null
          placa?: string
          preco_venda?: number | null
          registrado_em?: string | null
          registrado_por?: string | null
          repetido_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_editado_por_fkey"
            columns: ["editado_por"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_local_fkey"
            columns: ["local"]
            isOneToOne: false
            referencedRelation: "locais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "modelo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_repetido_id_fkey"
            columns: ["repetido_id"]
            isOneToOne: false
            referencedRelation: "repetidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos_loja: {
        Row: {
          id: string
          loja_id: string
          pasta_fotos: string | null
          preco: number | null
          tenant_id: string
          veiculo_id: string
        }
        Insert: {
          id?: string
          loja_id: string
          pasta_fotos?: string | null
          preco?: number | null
          tenant_id: string
          veiculo_id: string
        }
        Update: {
          id?: string
          loja_id?: string
          pasta_fotos?: string | null
          preco?: number | null
          tenant_id?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_loja_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_por_loja_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_por_loja_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_por_loja_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "view_veiculos_expandidos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      view_pariedade_veiculos: {
        Row: {
          id: number | null
          repetido_id: string | null
          veiculo_id: string | null
        }
        Relationships: []
      }
      view_sugestoes_repetidos: {
        Row: {
          ano_fabricacao: number | null
          ano_modelo: number | null
          caracteristicas_ids: string[] | null
          cor: string | null
          max_hodometro: number | null
          min_hodometro: number | null
          modelo_id: string | null
          qtd_veiculos: number | null
          tenant_id: string | null
          veiculo_ids: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "modelo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      view_veiculos_expandidos: {
        Row: {
          ano_fabricacao: number | null
          ano_modelo: number | null
          caracteristicas: Json | null
          chassi: string | null
          cor: string | null
          editado_em: string | null
          estado_veiculo: Database["public"]["Enums"]["estado_veiculo"] | null
          estado_venda: Database["public"]["Enums"]["estado_venda"] | null
          hodometro: number | null
          id: string | null
          local: Json | null
          modelo: Json | null
          observacao: string | null
          placa: string | null
          preco_venda: number | null
          registrado_em: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_tenant_invite: {
        Args: { p_token: string }
        Returns: boolean
      }
      agrupar_em_array: {
        Args: {
          p_coluna_grupo: string
          p_coluna_lookup_chave?: string
          p_coluna_lookup_valor?: string
          p_coluna_valor: string
          p_filtro?: string
          p_tabela_base: string
          p_tabela_lookup?: string
        }
        Returns: {
          grupo: string
          valores: string[]
        }[]
      }
      create_tenant: {
        Args: { p_dominio?: string; p_nome: string }
        Returns: {
          ativo: boolean
          created_at: string
          dominio: string | null
          id: string
          nome: string
          updated_at: string
        }
      }
      create_tenant_invite: {
        Args: {
          p_expires_at?: string
          p_invited_user_id: string
          p_tenant_id: string
        }
        Returns: {
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          invited_by_user_id: string
          invited_user_id: string
          status: string
          tenant_id: string
          token: string
        }
      }
      get_current_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_tenant_membership: {
        Args: { p_tenant_id: string }
        Returns: boolean
      }
      has_tenant_role: {
        Args: {
          p_role: Database["public"]["Enums"]["tenant_role"]
          p_tenant_id: string
        }
        Returns: boolean
      }
      validate_repetido: {
        Args: { p_repetido_id: string }
        Returns: Json
      }
    }
    Enums: {
      estado_veiculo:
        | "novo"
        | "seminovo"
        | "usado"
        | "sucata"
        | "limpo"
        | "sujo"
      estado_venda:
        | "disponivel"
        | "reservado"
        | "vendido"
        | "repassado"
        | "restrito"
      tenant_role: "owner" | "admin" | "manager" | "user"
      tipo_cambio: "manual" | "automatico" | "cvt" | "outro"
      tipo_carroceria:
        | "sedan"
        | "hatch"
        | "camioneta"
        | "suv"
        | "suv compacto"
        | "suv medio"
        | "van"
        | "buggy"
      tipo_combustivel:
        | "gasolina"
        | "alcool"
        | "flex"
        | "diesel"
        | "eletrico"
        | "hibrido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_veiculo: ["novo", "seminovo", "usado", "sucata", "limpo", "sujo"],
      estado_venda: [
        "disponivel",
        "reservado",
        "vendido",
        "repassado",
        "restrito",
      ],
      tenant_role: ["owner", "admin", "manager", "user"],
      tipo_cambio: ["manual", "automatico", "cvt", "outro"],
      tipo_carroceria: [
        "sedan",
        "hatch",
        "camioneta",
        "suv",
        "suv compacto",
        "suv medio",
        "van",
        "buggy",
      ],
      tipo_combustivel: [
        "gasolina",
        "alcool",
        "flex",
        "diesel",
        "eletrico",
        "hibrido",
      ],
    },
  },
} as const
