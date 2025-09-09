# Exemplos de Uso da API PostgREST - ConectaSaúde

Este arquivo contém exemplos práticos de como usar a API do sistema ConectaSaúde através do PostgREST.

## Configuração Base

```bash
# Variáveis de ambiente
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_ANON_KEY="sua-chave-anonima"
export SUPABASE_SERVICE_KEY="sua-chave-de-servico"

# Headers padrão
HEADERS="-H 'apikey: $SUPABASE_ANON_KEY' -H 'Authorization: Bearer $SUPABASE_ANON_KEY' -H 'Content-Type: application/json'"
```

## 1. MEDICAMENTOS

### Listar todos os medicamentos ativos
```bash
curl -X GET "$SUPABASE_URL/rest/v1/medicamentos_active" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Criar novo medicamento
```bash
curl -X POST "$SUPABASE_URL/rest/v1/medicamentos" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "dcb_dci": "Ibuprofeno",
    "forca_concentracao": "600mg",
    "unidade_controle_id": "uuid-da-unidade-comprimido",
    "validade": "2025-12-31",
    "custo": 0.25,
    "valor_repasse": 0.45,
    "local_armazenamento": "Prateleira A-3"
  }'
```

### Buscar medicamento por código interno
```bash
curl -X GET "$SUPABASE_URL/rest/v1/medicamentos_active?codigo_interno=eq.MED000001" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Buscar medicamentos próximos ao vencimento
```bash
curl -X GET "$SUPABASE_URL/rest/v1/vw_medicamentos_vencendo" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

## 2. MOVIMENTAÇÕES DE ESTOQUE (RPCs)

### Entrada de estoque
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/rpc_estoque_entrada" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_medicamento_id": "uuid-do-medicamento",
    "p_unidade_destino_id": "uuid-da-unidade",
    "p_quantidade": 100,
    "p_lote": "LOTE-2024-001",
    "p_data_entrada": "2024-09-08",
    "p_motivo": "Compra mensal de medicamentos"
  }'
```

### Saída de estoque
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/rpc_estoque_saida" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_medicamento_id": "uuid-do-medicamento",
    "p_unidade_origem_id": "uuid-da-unidade",
    "p_quantidade": 25,
    "p_destino": "UBS Vila Nova - Dispensação",
    "p_motivo": "Atendimento semanal de pacientes"
  }'
```

### Transferência entre unidades
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/rpc_estoque_transferencia" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_medicamento_id": "uuid-do-medicamento",
    "p_unidade_origem_id": "uuid-almoxarifado",
    "p_unidade_destino_id": "uuid-ubs",
    "p_quantidade": 50,
    "p_motivo": "Reposição de estoque semanal"
  }'
```

### Alterar status do medicamento
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/rpc_medicamento_set_status" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_medicamento_id": "uuid-do-medicamento",
    "p_novo_status": "INATIVO",
    "p_motivo": "Medicamento descontinuado pelo fabricante"
  }'
```

### Marcar medicamento como obsoleto
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/rpc_medicamento_set_obsoleto" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_medicamento_id": "uuid-do-medicamento",
    "p_obsoleto": true,
    "p_motivo": "Substituído por nova formulação"
  }'
```

## 3. CONSULTAS DE ESTOQUE

### Consultar saldo atual de todos os medicamentos
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/rpc_consultar_saldo_estoque" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Consultar saldo de medicamento específico
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/rpc_consultar_saldo_estoque" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_medicamento_id": "uuid-do-medicamento"
  }'
```

### Consultar estoque de uma unidade específica
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/rpc_consultar_saldo_estoque" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_unidade_id": "uuid-da-unidade"
  }'
```

## 4. RELATÓRIOS

### Alertas de mínimo atingido
```bash
curl -X GET "$SUPABASE_URL/rest/v1/vw_alerta_minimo_atingido" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Medicamentos vencendo em 30 dias
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/vw_medicamentos_vencendo_em" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "dias": 30
  }'
```

### Relatório de estoque por período
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/vw_estoque_por_periodo" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data_inicio": "2024-08-01",
    "data_fim": "2024-08-31",
    "unidade_filtro": null
  }'
```

### Dashboard executivo
```bash
curl -X GET "$SUPABASE_URL/rest/v1/vw_dashboard_executivo" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Histórico de movimentações
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/rpc_historico_movimentacoes" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_medicamento_id": null,
    "p_unidade_id": null,
    "p_tipo": null,
    "p_data_inicio": "2024-08-01",
    "p_data_fim": "2024-08-31",
    "p_limit": 50
  }'
```

## 5. MOTORISTAS

### Criar motorista com endereço e escala
```bash
# 1. Criar motorista
curl -X POST "$SUPABASE_URL/rest/v1/motoristas" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Antonio Silva",
    "cpf": "123.456.789-10",
    "rg": "MG-12.345.679",
    "data_nascimento": "1985-06-20",
    "estado_civil": "CASADO",
    "sexo": "M",
    "email": "antonio.silva@saude.gov.br",
    "telefone": "(11) 99999-1234",
    "possui_acesso": true,
    "perfil_acesso_id": "uuid-perfil-motorista",
    "cargo_id": "uuid-cargo-motorista"
  }'

# 2. Adicionar endereço (usar ID retornado)
curl -X POST "$SUPABASE_URL/rest/v1/motoristas_enderecos" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "motorista_id": "uuid-do-motorista",
    "logradouro": "Rua Nova Esperança",
    "numero": "200",
    "bairro": "Jardim Paulista",
    "cidade": "São Paulo",
    "cep": "12345-678"
  }'

# 3. Adicionar escalas
curl -X POST "$SUPABASE_URL/rest/v1/motoristas_escalas" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "motorista_id": "uuid-do-motorista",
    "dia_semana": 1,
    "periodos": ["MANHA", "TARDE"]
  }'
```

### Listar motoristas ativos com escalas
```bash
curl -X GET "$SUPABASE_URL/rest/v1/motoristas_active?select=*,motoristas_escalas(*),motoristas_enderecos(*)" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

## 6. VEÍCULOS

### Criar veículo
```bash
curl -X POST "$SUPABASE_URL/rest/v1/veiculos" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "marca": "Fiat",
    "modelo": "Ducato",
    "ano_fabricacao": 2023,
    "placa": "ABC1D23",
    "capacidade_passageiros": 10,
    "combustivel": "DIESEL",
    "autonomia_km": 15.5,
    "tipo_id": "uuid-tipo-van",
    "cor": "Branca",
    "renavam": "12345678902"
  }'
```

### Buscar veículos por situação
```bash
curl -X GET "$SUPABASE_URL/rest/v1/veiculos_active?situacao=eq.ATIVO" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Validar placa antes de cadastrar
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/validate_placa" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '"ABC-1234"'
```

## 7. MUNÍCIPES

### Criar munícipe com dados de saúde
```bash
# 1. Criar munícipe
curl -X POST "$SUPABASE_URL/rest/v1/municipes" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "João Santos Silva",
    "cpf": "987.654.321-00",
    "rg": "SP-98.765.432",
    "data_nascimento": "1980-12-15",
    "estado_civil": "CASADO",
    "sexo": "M",
    "email": "joao.santos@email.com",
    "telefone": "(11) 99999-5678",
    "nome_mae": "Maria Santos"
  }'

# 2. Adicionar endereço
curl -X POST "$SUPABASE_URL/rest/v1/municipes_enderecos" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "municipe_id": "uuid-do-municipe",
    "logradouro": "Rua das Palmeiras",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "cep": "01234-567"
  }'

# 3. Adicionar dados de saúde
curl -X POST "$SUPABASE_URL/rest/v1/municipes_saude" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "municipe_id": "uuid-do-municipe",
    "cartao_sus": "123456789012345",
    "uso_continuo_medicamentos": true,
    "quais_medicamentos": "Losartana 50mg - 1 cp manhã, Metformina 500mg - 2 cp ao dia",
    "tem_deficiencia_fisica": false,
    "necessita_acompanhante": false,
    "doenca_cronica_id": "uuid-hipertensao",
    "doenca_tipo_id": "uuid-cardiovascular"
  }'
```

### Buscar munícipe por CPF
```bash
curl -X GET "$SUPABASE_URL/rest/v1/municipes_active?cpf=eq.987.654.321-00&select=*,municipes_enderecos(*),municipes_saude(*)" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Buscar munícipes por cartão SUS
```bash
curl -X GET "$SUPABASE_URL/rest/v1/municipes_saude?cartao_sus=eq.123456789012345&select=*,municipes(*)" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

## 8. EDGE FUNCTIONS

### Upload de foto do munícipe
```bash
curl -X POST "$SUPABASE_URL/functions/v1/upload_municipe_foto" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "municipe_id": "uuid-do-municipe",
    "file_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "file_name": "foto_municipe.jpg",
    "content_type": "image/jpeg"
  }'
```

### Export de relatórios
```bash
# Export CSV de estoque atual
curl -X POST "$SUPABASE_URL/functions/v1/relatorios_export" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "estoque_atual",
    "formato": "csv"
  }' \
  --output estoque_atual.csv

# Export JSON de medicamentos vencendo
curl -X POST "$SUPABASE_URL/functions/v1/relatorios_export" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "medicamentos_vencendo",
    "formato": "json",
    "filtros": {
      "dias_vencimento": 30
    }
  }'

# Export de relatório por período
curl -X POST "$SUPABASE_URL/functions/v1/relatorios_export" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "estoque_periodo",
    "formato": "csv",
    "filtros": {
      "data_inicio": "2024-08-01",
      "data_fim": "2024-08-31",
      "unidade_id": "uuid-da-unidade"
    }
  }' \
  --output relatorio_periodo.csv
```

## 9. FILTROS AVANÇADOS

### Buscar medicamentos com múltiplos filtros
```bash
curl -X GET "$SUPABASE_URL/rest/v1/vw_estoque_atual?status_estoque=eq.CRÍTICO&status_validade=eq.VENCE_30_DIAS" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Paginação
```bash
curl -X GET "$SUPABASE_URL/rest/v1/medicamentos_active?limit=10&offset=20" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Ordenação
```bash
curl -X GET "$SUPABASE_URL/rest/v1/vw_estoque_atual?order=dcb_dci.asc,quantidade.desc" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

### Busca por texto
```bash
curl -X GET "$SUPABASE_URL/rest/v1/medicamentos_active?dcb_dci=ilike.*paracetamol*" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

## 10. SOFT DELETE

### Soft delete de medicamento
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/soft_delete_record" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "medicamentos",
    "record_id": "uuid-do-medicamento",
    "motivo": "Medicamento descontinuado"
  }'
```

### Restaurar registro (apenas admin)
```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/restore_record" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "medicamentos",
    "record_id": "uuid-do-medicamento",
    "motivo": "Medicamento reativado por solicitação médica"
  }'
```

## Notas Importantes:

1. **Autenticação**: Substitua `$SUPABASE_ANON_KEY` pelo token JWT do usuário autenticado para operações que requerem permissões específicas.

2. **UUIDs**: Substitua os UUIDs de exemplo pelos valores reais do seu banco de dados.

3. **Validações**: Todas as operações passam por validações de RLS e triggers.

4. **Logs**: Todas as operações críticas geram logs de auditoria automaticamente.

5. **Transações**: As RPCs de movimentação são atômicas e reversíveis em caso de erro.
