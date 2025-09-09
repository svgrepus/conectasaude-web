# 📋 ConectaSaúde - Documentação das Entidades do Sistema

## 🏥 Sistema de Gestão Municipal de Saúde

Este documento descreve todas as entidades (tabelas) do sistema ConectaSaúde e seus respectivos campos com explicações detalhadas.

---

## 📚 **ÍNDICE**

1. [Cadastros Básicos](#1-cadastros-básicos)
2. [Unidades de Armazenamento](#2-unidades-de-armazenamento)
3. [Medicamentos](#3-medicamentos)
4. [Movimentações de Estoque](#4-movimentações-de-estoque)
5. [Motoristas](#5-motoristas)
6. [Veículos](#6-veículos)
7. [Munícipes](#7-munícipes)
8. [Logs e Auditoria](#8-logs-e-auditoria)

---

## 1. **CADASTROS BÁSICOS**

### 🚗 `basic_vehicle_types` - Tipos de Veículos

**Descrição:** Tabela de apoio para categorizar os tipos de veículos da frota municipal.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do tipo de veículo |
| `nome` | TEXT | Nome do tipo (ex: "Ambulância", "Van", "Ônibus", "Carro") |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

### 👔 `basic_roles` - Cargos/Funções

**Descrição:** Define os cargos e funções dos funcionários da secretaria.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do cargo |
| `nome` | TEXT | Nome do cargo (ex: "Motorista", "Enfermeiro", "Médico") |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

### 🔐 `basic_access_profiles` - Perfis de Acesso

**Descrição:** Define os níveis de acesso e permissões no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do perfil |
| `nome` | TEXT | Nome do perfil (ex: "Administrador", "Operador", "Consulta") |
| `descricao` | TEXT | Descrição detalhada das permissões do perfil |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

### 🏥 `basic_health_chronic_diseases` - Doenças Crônicas

**Descrição:** Cadastro de doenças crônicas para associar aos munícipes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único da doença |
| `nome` | TEXT | Nome da doença crônica (ex: "Diabetes", "Hipertensão") |
| `cid10` | TEXT | Código CID-10 da doença (Classificação Internacional de Doenças) |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

### 🦠 `basic_health_disease_types` - Tipos de Doenças

**Descrição:** Categorização dos tipos de doenças para classificação médica.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do tipo |
| `nome` | TEXT | Nome do tipo (ex: "Cardiovascular", "Respiratória", "Metabólica") |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

## 2. **UNIDADES DE ARMAZENAMENTO**

### 🏢 `stock_units` - Unidades de Estoque (Locais Físicos)

**Descrição:** Define os locais físicos onde os medicamentos são armazenados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único da unidade |
| `nome` | TEXT | Nome da unidade (ex: "Farmácia Central", "UBS Vila Nova") |
| `endereco` | TEXT | Endereço completo da unidade |
| `responsavel` | TEXT | Nome do responsável pela unidade |
| `telefone` | TEXT | Telefone de contato da unidade |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

### 📏 `stock_control_units` - Unidades de Controle (Medidas)

**Descrição:** Define as unidades de medida para controle de medicamentos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único da unidade de medida |
| `nome` | TEXT | Nome completo (ex: "Miligrama", "Mililitro", "Comprimido") |
| `abreviacao` | TEXT | Abreviação da unidade (ex: "mg", "ml", "cp") |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

## 3. **MEDICAMENTOS**

### 💊 `medicamentos` - Cadastro de Medicamentos

**Descrição:** Tabela principal para cadastro e controle de medicamentos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do medicamento |
| `dcb_dci` | TEXT | Denominação Comum Brasileira/Internacional (nome técnico) |
| `forca_concentracao` | TEXT | Força/concentração (ex: "500mg", "10ml/5mg") |
| `unidade_controle_id` | UUID | Referência à unidade de medida (FK para `stock_control_units`) |
| `codigo_interno` | TEXT | Código interno gerado automaticamente (ex: "MED000001") |
| `status` | TEXT | Status do medicamento: "ATIVO" ou "INATIVO" |
| `obsoleto` | BOOLEAN | Indica se o medicamento está obsoleto (descontinuado) |
| `validade` | DATE | Data de validade do medicamento |
| `custo` | NUMERIC | Custo de aquisição do medicamento |
| `valor_repasse` | NUMERIC | Valor de repasse/distribuição |
| `local_armazenamento` | TEXT | Localização específica dentro da unidade |
| `observacoes` | TEXT | Observações gerais sobre o medicamento |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

### 📦 `medicamentos_estoque` - Estoque por Unidade

**Descrição:** Controla a quantidade de cada medicamento em cada unidade de estoque.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do estoque |
| `medicamento_id` | UUID | Referência ao medicamento (FK para `medicamentos`) |
| `unidade_id` | UUID | Referência à unidade de estoque (FK para `stock_units`) |
| `quantidade` | NUMERIC | Quantidade atual em estoque (com 3 casas decimais) |
| `minimo_alerta` | NUMERIC | Quantidade mínima para disparar alerta de reposição |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |

---

## 4. **MOVIMENTAÇÕES DE ESTOQUE**

### 📋 `estoque_movimentos` - Movimentações de Estoque

**Descrição:** Registra todas as movimentações de entrada, saída e transferência de medicamentos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único da movimentação |
| `tipo` | TEXT | Tipo: "ENTRADA", "SAIDA" ou "TRANSFERENCIA" |
| `medicamento_id` | UUID | Referência ao medicamento (FK para `medicamentos`) |
| `unidade_origem_id` | UUID | Unidade de origem (para saída/transferência) |
| `unidade_destino_id` | UUID | Unidade de destino (para entrada/transferência) |
| `quantidade` | NUMERIC | Quantidade movimentada (sempre positiva) |
| `lote` | TEXT | Número do lote do medicamento |
| `data_entrada` | DATE | Data de entrada na unidade (quando aplicável) |
| `destino` | TEXT | Descrição do destino final (para saídas) |
| `motivo` | TEXT | Motivo/justificativa da movimentação |
| `executed_at` | TIMESTAMPTZ | Data e hora da execução da movimentação |
| `executed_by` | UUID | ID do usuário que executou a movimentação |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

### 📚 `estoque_movimentos_history` - Histórico de Movimentações

**Descrição:** Mantém um histórico completo de todas as alterações nas movimentações.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do histórico |
| `original_id` | UUID | ID da movimentação original |
| `snapshot` | JSONB | Snapshot completo dos dados no momento da alteração |
| `action` | TEXT | Tipo de ação: "INSERT", "UPDATE" ou "DELETE" |
| `changed_at` | TIMESTAMPTZ | Data e hora da alteração |
| `changed_by` | UUID | ID do usuário que fez a alteração |

---

## 5. **MOTORISTAS**

### 🚗 `motoristas` - Cadastro de Motoristas

**Descrição:** Cadastro completo dos motoristas da secretaria de saúde.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do motorista |
| `nome` | TEXT | Nome completo do motorista |
| `cpf` | TEXT | CPF (validado automaticamente) |
| `rg` | TEXT | Número do RG |
| `data_nascimento` | DATE | Data de nascimento |
| `estado_civil` | TEXT | Estado civil: "SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL" |
| `sexo` | TEXT | Sexo: "M" (Masculino) ou "F" (Feminino) |
| `email` | TEXT | Email (validado automaticamente) |
| `telefone` | TEXT | Número de telefone |
| `possui_acesso` | BOOLEAN | Indica se tem acesso ao sistema |
| `perfil_acesso_id` | UUID | Referência ao perfil de acesso (FK para `basic_access_profiles`) |
| `cargo_id` | UUID | Referência ao cargo (FK para `basic_roles`) |
| `foto_url` | TEXT | URL da foto do motorista |
| `observacoes` | TEXT | Observações gerais |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

### 🏠 `motoristas_enderecos` - Endereços dos Motoristas

**Descrição:** Endereços residenciais dos motoristas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do endereço |
| `motorista_id` | UUID | Referência ao motorista (FK para `motoristas`) |
| `logradouro` | TEXT | Nome da rua/avenida |
| `numero` | TEXT | Número da residência |
| `complemento` | TEXT | Complemento (apto, bloco, etc.) |
| `bairro` | TEXT | Nome do bairro |
| `cidade` | TEXT | Nome da cidade |
| `cep` | TEXT | CEP no formato 12345-678 |
| `zona_rural` | BOOLEAN | Indica se é zona rural |
| `ref_zona_rural` | TEXT | Referência para localização em zona rural |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |

---

### 📅 `motoristas_escalas` - Escalas de Trabalho

**Descrição:** Define as escalas de trabalho dos motoristas por dia da semana.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único da escala |
| `motorista_id` | UUID | Referência ao motorista (FK para `motoristas`) |
| `dia_semana` | INTEGER | Dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado) |
| `periodos` | TEXT[] | Array de períodos: "MANHA", "TARDE", "NOITE", "PLANTAO" |
| `observacoes` | TEXT | Observações sobre a escala |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |

---

## 6. **VEÍCULOS**

### 🚙 `veiculos` - Cadastro de Veículos

**Descrição:** Cadastro completo dos veículos da frota municipal.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do veículo |
| `marca` | TEXT | Marca do veículo (ex: "Volkswagen", "Fiat") |
| `modelo` | TEXT | Modelo do veículo (ex: "Saveiro", "Ducato") |
| `ano_fabricacao` | INTEGER | Ano de fabricação (validado entre 1980 e ano atual) |
| `placa` | TEXT | Placa do veículo (validada para padrões brasileiros) |
| `capacidade_passageiros` | INTEGER | Número máximo de passageiros |
| `combustivel` | TEXT | Tipo: "GASOLINA", "ALCOOL", "DIESEL", "FLEX", "ELETRICO" |
| `autonomia_km` | NUMERIC | Autonomia em quilômetros |
| `situacao` | TEXT | Situação: "ATIVO", "INATIVO", "MANUTENCAO" |
| `tipo_id` | UUID | Referência ao tipo de veículo (FK para `basic_vehicle_types`) |
| `cor` | TEXT | Cor do veículo |
| `renavam` | TEXT | Número do RENAVAM |
| `chassi` | TEXT | Número do chassi |
| `observacoes` | TEXT | Observações gerais |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

## 7. **MUNÍCIPES**

### 👥 `municipes` - Cadastro de Munícipes

**Descrição:** Cadastro dos cidadãos atendidos pela secretaria de saúde.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do munícipe |
| `nome_completo` | TEXT | Nome completo do munícipe |
| `cpf` | TEXT | CPF (validado automaticamente) |
| `rg` | TEXT | Número do RG |
| `data_nascimento` | DATE | Data de nascimento |
| `estado_civil` | TEXT | Estado civil: "SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL" |
| `sexo` | TEXT | Sexo: "M" (Masculino) ou "F" (Feminino) |
| `email` | TEXT | Email (validado automaticamente) |
| `telefone` | TEXT | Número de telefone |
| `nome_mae` | TEXT | Nome completo da mãe |
| `foto_url` | TEXT | URL da foto do munícipe |
| `observacoes` | TEXT | Observações gerais |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |
| `deleted_at` | TIMESTAMPTZ | Data de exclusão lógica (soft delete) |

---

### 🏠 `municipes_enderecos` - Endereços dos Munícipes

**Descrição:** Endereços residenciais dos munícipes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do endereço |
| `municipe_id` | UUID | Referência ao munícipe (FK para `municipes`) |
| `logradouro` | TEXT | Nome da rua/avenida |
| `numero` | TEXT | Número da residência |
| `complemento` | TEXT | Complemento (apto, bloco, etc.) |
| `bairro` | TEXT | Nome do bairro |
| `cidade` | TEXT | Nome da cidade |
| `cep` | TEXT | CEP no formato 12345-678 |
| `zona_rural` | BOOLEAN | Indica se é zona rural |
| `ref_zona_rural` | TEXT | Referência para localização em zona rural |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |

---

### 🏥 `municipes_saude` - Dados de Saúde dos Munícipes

**Descrição:** Informações específicas de saúde dos munícipes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único dos dados de saúde |
| `municipe_id` | UUID | Referência ao munícipe (FK para `municipes`) |
| `cartao_sus` | CHAR(15) | Número do Cartão SUS (15 dígitos) |
| `uso_continuo_medicamentos` | BOOLEAN | Indica se faz uso contínuo de medicamentos |
| `quais_medicamentos` | TEXT | Lista dos medicamentos em uso contínuo |
| `tem_deficiencia_fisica` | BOOLEAN | Indica se possui deficiência física |
| `necessita_acompanhante` | BOOLEAN | Indica se necessita acompanhante |
| `doenca_cronica_id` | UUID | Referência à doença crônica (FK para `basic_health_chronic_diseases`) |
| `doenca_tipo_id` | UUID | Referência ao tipo de doença (FK para `basic_health_disease_types`) |
| `observacoes_medicas` | TEXT | Observações médicas importantes |
| `created_at` | TIMESTAMPTZ | Data e hora de criação do registro |
| `updated_at` | TIMESTAMPTZ | Data e hora da última atualização |

---

## 8. **LOGS E AUDITORIA**

### 📊 `status_changes` - Log de Alterações de Status

**Descrição:** Registra todas as alterações de status e campos importantes do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do log |
| `entidade` | TEXT | Nome da tabela/entidade alterada |
| `entidade_id` | UUID | ID do registro alterado |
| `campo` | TEXT | Nome do campo alterado |
| `valor_anterior` | TEXT | Valor antes da alteração |
| `valor_novo` | TEXT | Valor após a alteração |
| `changed_at` | TIMESTAMPTZ | Data e hora da alteração |
| `changed_by` | UUID | ID do usuário que fez a alteração |
| `motivo` | TEXT | Motivo/justificativa da alteração |

---

## 🔍 **CARACTERÍSTICAS TÉCNICAS**

### **Validações Automáticas:**
- ✅ **CPF:** Validação matemática do CPF brasileiro
- ✅ **Email:** Validação de formato de email
- ✅ **CEP:** Formato brasileiro (12345-678)
- ✅ **Placa:** Formatos antigo (ABC-1234) e Mercosul (ABC1D23)
- ✅ **Cartão SUS:** 15 dígitos numéricos

### **Soft Delete:**
- Todas as entidades principais suportam exclusão lógica via campo `deleted_at`
- Registros excluídos não aparecem nas consultas normais

### **Auditoria:**
- Timestamps automáticos de criação e atualização
- Log completo de alterações de status
- Histórico de movimentações de estoque

### **Performance:**
- Índices otimizados para consultas frequentes
- Índices específicos para campos de filtro
- Índices compostos para relacionamentos

---

## 📈 **Sequências e Códigos Automáticos**

### **Códigos Internos:**
- **Medicamentos:** `MED000001`, `MED000002`, etc.
- Gerados automaticamente através da sequência `medicamento_codigo_seq`

---

*Documentação gerada para o sistema ConectaSaúde - Gestão Municipal de Saúde*  
*Versão: 1.0 | Data: Setembro 2025*
