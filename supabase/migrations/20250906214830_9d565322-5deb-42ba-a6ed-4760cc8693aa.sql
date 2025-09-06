-- Fix linter: set stable search_path on existing functions
CREATE OR REPLACE FUNCTION public.bump_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  INSERT INTO public.versions(table_name, version)
  VALUES (TG_TABLE_NAME, 1)
  ON CONFLICT (table_name)
  DO UPDATE SET version = public.versions.version + 1;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.agrupar_em_array(
  p_tabela_base text,
  p_coluna_grupo text,
  p_coluna_valor text,
  p_filtro text DEFAULT NULL::text,
  p_tabela_lookup text DEFAULT NULL::text,
  p_coluna_lookup_chave text DEFAULT NULL::text,
  p_coluna_lookup_valor text DEFAULT NULL::text
)
 RETURNS TABLE(grupo text, valores text[])
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
DECLARE
    sql_base text;
BEGIN
    -- SELECT base agrupando IDs
    sql_base := format(
        'SELECT %I::text AS grupo, array_agg(DISTINCT %I)::text[] AS valores
         FROM %I
         GROUP BY %I',
         p_coluna_grupo,
         p_coluna_valor,
         p_tabela_base,
         p_coluna_grupo
    );

    -- Se houver lookup, faz join para converter IDs em nomes
    IF p_tabela_lookup IS NOT NULL THEN
        sql_base := format(
            'WITH agrupado AS (%s)
             SELECT a.grupo, array_agg(DISTINCT e.%I)::text[] AS valores
             FROM agrupado a
             JOIN %I e ON a.valores::text[] @> ARRAY[e.%I::text]
             GROUP BY a.grupo',
            sql_base,
            p_coluna_lookup_valor,
            p_tabela_lookup,
            p_coluna_lookup_chave
        );
    END IF;

    -- Aplica filtro se fornecido
    IF p_filtro IS NOT NULL THEN
        sql_base := format(
            'WITH final AS (%s)
             SELECT *
             FROM final
             WHERE %s',
            sql_base,
            p_filtro
        );
    END IF;

    RETURN QUERY EXECUTE sql_base;
END;
$$;