# 🔧 Prompt para Implementação - Telas de Cadastros Básicos

## 📋 Objetivo
Criar um sistema completo de configuração dos cadastros básicos do ConectaSaúde, permitindo gerenciar a estrutura hierárquica de **Contextos → Subcontextos → Campos → Opções**.

## 🏗️ Estrutura de Dados Existente

### **Tabelas do Banco de Dados:**

```sql
-- 1. Contextos (Nível 1)
contexts {
  id: number (PK)
  name: string
  slug: string
  created_at: timestamp
  updated_at: timestamp
}

-- 2. Subcontextos (Nível 2)
subcontexts {
  id: number (PK)
  context_id: number (FK → contexts.id)
  name: string
  slug: string
  created_at: timestamp
  updated_at: timestamp
}

-- 3. Campos de Combo (Nível 3)
combo_fields {
  id: number (PK)
  subcontext_id: number (FK → subcontexts.id)
  display_name: string
  field_key: string
  area: string (opcional)
  created_at: timestamp
  updated_at: timestamp
}

-- 4. Opções dos Combos (Nível 4)
combo_options {
  id: number (PK)
  field_id: number (FK → combo_fields.id)
  option_label: string
  option_value: string
  sort_order: number
  created_at: timestamp
  updated_at: timestamp
}
```

### **Estrutura Hierárquica Atual:**
```
📁 Cadastros Básicos (Context)
├── 👥 Munícipes (Subcontext)
│   ├── 🦠 doenca_cronica (Field)
│   │   ├── Diabetes (Option)
│   │   ├── Hipertensão (Option)
│   │   └── Asma (Option)
│   └── 🏥 tipo_de_doenca (Field)
│       ├── Crônica (Option)
│       └── Aguda (Option)
├── 🚗 Veículos (Subcontext)
│   └── 🚙 tipo_de_veiculo (Field)
│       ├── Ambulância (Option)
│       ├── Van (Option)
│       └── Carro (Option)
└── 👨‍💼 Colaboradores (Subcontext)
    ├── 💼 cargo (Field)
    │   ├── Médico (Option)
    │   ├── Enfermeiro (Option)
    │   └── Motorista (Option)
    └── 🔐 perfil_de_acesso (Field)
        ├── Administrador (Option)
        ├── Operador (Option)
        └── Consulta (Option)
```

## 🎯 Telas a Implementar

### **1. Tela Principal - Lista de Contextos**
- **Localização:** Menu "Cadastros Básicos" → "Configurar Combos"
- **Layout:** Lista hierárquica expansível (TreeView)
- **Funcionalidades:**
  - ✅ Visualizar estrutura completa em árvore
  - ✅ Expandir/colapsar níveis
  - ✅ Botões de ação em cada item
  - ✅ Busca/filtro por nome
  - ✅ Ordenação alfabética

### **2. Modais de CRUD por Nível**

#### **A) Modal Contexto:**
```typescript
interface ContextForm {
  name: string;        // "Cadastros Básicos"
  slug: string;        // "cadastros_basicos" (auto-gerado)
}
```

#### **B) Modal Subcontexto:**
```typescript
interface SubcontextForm {
  context_id: number;  // ID do contexto pai
  name: string;        // "Munícipes"
  slug: string;        // "municipes" (auto-gerado)
}
```

#### **C) Modal Campo:**
```typescript
interface ComboFieldForm {
  subcontext_id: number;  // ID do subcontexto pai
  display_name: string;   // "Doença Crônica"
  field_key: string;      // "doenca_cronica" (auto-gerado)
  area?: string;          // "Saúde" (opcional)
}
```

#### **D) Modal Opção:**
```typescript
interface ComboOptionForm {
  field_id: number;       // ID do campo pai
  option_label: string;   // "Diabetes"
  option_value: string;   // "diabetes" (auto-gerado)
  sort_order: number;     // 1, 2, 3... (auto-incremento)
}
```

## 🎨 Especificações de Design

### **Layout Principal:**
- ✅ **Header:** Título "Cadastros Básicos" + botão "Novo Contexto"
- ✅ **TreeView:** Estrutura hierárquica com ícones
- ✅ **Ações:** Botões inline (➕ Adicionar, ✏️ Editar, 🗑️ Excluir)
- ✅ **Cores:** Vermelho #ea2a33 como cor primária
- ✅ **Responsivo:** Funcionar em desktop e mobile

### **Ícones por Nível:**
- 📁 **Contexto:** `folder` ou `settings`
- 📂 **Subcontexto:** `folder-open` ou `grid`
- 🏷️ **Campo:** `tag` ou `list`
- 🔸 **Opção:** `radio-button-on` ou `ellipse`

### **Estados Visuais:**
- ✅ **Expandido/Colapsado:** Setas indicativas
- ✅ **Hover:** Destaque suave
- ✅ **Ativo:** Bordas coloridas
- ✅ **Loading:** Skeleton ou spinner

## 🛠️ Funcionalidades Técnicas

### **APIs Necessárias (já implementadas no combosService):**

#### **Leitura:**
```typescript
// Buscar estrutura completa
await combosService.getComboStructure();

// Buscar por nível
await combosService.getContexts();
await combosService.getSubcontexts(contextId);
await combosService.getComboFields(subcontextId);
await combosService.getComboOptions(context, subcontext, fieldKey);
```

#### **Escrita (a implementar):**
```typescript
// Contextos
await combosService.createContext(data);
await combosService.updateContext(id, data);
await combosService.deleteContext(id);

// Subcontextos
await combosService.createSubcontext(data);
await combosService.updateSubcontext(id, data);
await combosService.deleteSubcontext(id);

// Campos
await combosService.createComboField(data);
await combosService.updateComboField(id, data);
await combosService.deleteComboField(id);

// Opções
await combosService.createComboOption(data);
await combosService.updateComboOption(id, data);
await combosService.deleteComboOption(id);
```

### **Validações Obrigatórias:**
- ✅ **Nome único** por nível/contexto
- ✅ **Slug único** gerado automaticamente
- ✅ **Relacionamentos** respeitados (não deletar pai com filhos)
- ✅ **Ordem sequencial** nas opções
- ✅ **Campos obrigatórios** preenchidos

### **Funcionalidades Avançadas:**
- 🔄 **Drag & Drop** para reordenar opções
- 📋 **Duplicar** estruturas existentes
- 📥 **Importar** via CSV/JSON
- 📤 **Exportar** configurações
- 🔍 **Busca global** em todos os níveis
- 📊 **Estatísticas** de uso

## 🎯 Fluxo de Usuário

### **Cenário 1: Criar Nova Estrutura**
1. Clicar "Novo Contexto" → Modal abrir
2. Preencher nome → Slug gerado automaticamente
3. Salvar → Contexto criado e expandido
4. Clicar "➕" no contexto → Modal Subcontexto
5. Repetir processo para campos e opções

### **Cenário 2: Editar Existente**
1. Clicar "✏️" em qualquer item → Modal com dados
2. Alterar informações → Salvar
3. Lista atualizada automaticamente

### **Cenário 3: Excluir Item**
1. Clicar "🗑️" → Confirmação
2. Verificar dependências → Aviso se houver filhos
3. Confirmar → Item removido

## 📂 Arquivos a Criar

### **Componentes:**
```
📁 src/screens/cadastros-basicos/
├── 📄 CadastrosBasicosScreen.tsx        # Tela principal
├── 📄 components/
│   ├── 📄 ContextTree.tsx               # Árvore hierárquica
│   ├── 📄 TreeNode.tsx                  # Nó da árvore
│   ├── 📄 ActionButtons.tsx             # Botões de ação
│   └── 📄 modals/
│       ├── 📄 ContextModal.tsx          # Modal contexto
│       ├── 📄 SubcontextModal.tsx       # Modal subcontexto
│       ├── 📄 ComboFieldModal.tsx       # Modal campo
│       └── 📄 ComboOptionModal.tsx      # Modal opção
└── 📄 hooks/
    ├── 📄 useCombosData.tsx             # Hook para dados
    └── 📄 useCombosActions.tsx          # Hook para ações
```

### **Serviços (expandir combosService.ts):**
```typescript
// Adicionar métodos CRUD
class CombosService {
  // ... métodos existentes ...
  
  // CRUD Contextos
  async createContext(data: Omit<Context, 'id' | 'created_at' | 'updated_at'>): Promise<Context>;
  async updateContext(id: number, data: Partial<Context>): Promise<Context>;
  async deleteContext(id: number): Promise<void>;
  
  // CRUD Subcontextos
  async createSubcontext(data: Omit<Subcontext, 'id' | 'created_at' | 'updated_at'>): Promise<Subcontext>;
  async updateSubcontext(id: number, data: Partial<Subcontext>): Promise<Subcontext>;
  async deleteSubcontext(id: number): Promise<void>;
  
  // CRUD Campos
  async createComboField(data: Omit<ComboField, 'id' | 'created_at' | 'updated_at'>): Promise<ComboField>;
  async updateComboField(id: number, data: Partial<ComboField>): Promise<ComboField>;
  async deleteComboField(id: number): Promise<void>;
  
  // CRUD Opções
  async createComboOption(data: Omit<ComboOption, 'id' | 'created_at' | 'updated_at'>): Promise<ComboOption>;
  async updateComboOption(id: number, data: Partial<ComboOption>): Promise<ComboOption>;
  async deleteComboOption(id: number): Promise<void>;
  
  // Utilitários
  generateSlug(name: string): string;
  validateDependencies(type: string, id: number): Promise<boolean>;
  reorderOptions(fieldId: number, newOrder: number[]): Promise<void>;
}
```

## 🎨 Mockup de Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🔧 Cadastros Básicos                    [➕ Novo Contexto] │
├─────────────────────────────────────────────────────────┤
│ 🔍 [Buscar...]                                           │
├─────────────────────────────────────────────────────────┤
│ 📁 Cadastros Básicos                    [➕] [✏️] [🗑️]    │
│  └── 👥 Munícipes                       [➕] [✏️] [🗑️]    │
│      ├── 🦠 doenca_cronica              [➕] [✏️] [🗑️]    │
│      │   ├── 🔸 Diabetes                     [✏️] [🗑️]    │
│      │   ├── 🔸 Hipertensão                  [✏️] [🗑️]    │
│      │   └── 🔸 Asma                         [✏️] [🗑️]    │
│      └── 🏥 tipo_de_doenca              [➕] [✏️] [🗑️]    │
│          ├── 🔸 Crônica                      [✏️] [🗑️]    │
│          └── 🔸 Aguda                        [✏️] [🗑️]    │
│  └── 🚗 Veículos                       [➕] [✏️] [🗑️]    │
│      └── 🚙 tipo_de_veiculo             [➕] [✏️] [🗑️]    │
│          ├── 🔸 Ambulância                   [✏️] [🗑️]    │
│          ├── 🔸 Van                          [✏️] [🗑️]    │
│          └── 🔸 Carro                        [✏️] [🗑️]    │
└─────────────────────────────────────────────────────────┘
```

## ✅ Critérios de Aceitação

### **Funcionalidades Básicas:**
- [ ] Visualizar estrutura hierárquica completa
- [ ] Criar/editar/excluir contextos
- [ ] Criar/editar/excluir subcontextos
- [ ] Criar/editar/excluir campos
- [ ] Criar/editar/excluir opções
- [ ] Validações de integridade referencial
- [ ] Geração automática de slugs
- [ ] Busca e filtros

### **UX/UI:**
- [ ] Layout responsivo (desktop + mobile)
- [ ] Cores consistentes com o sistema (#ea2a33)
- [ ] Ícones intuitivos para cada nível
- [ ] Animações suaves de expansão/colapso
- [ ] Feedback visual de ações (loading, sucesso, erro)
- [ ] Modais bem estruturados com validação

### **Performance:**
- [ ] Carregamento incremental (lazy loading)
- [ ] Cache de dados locais
- [ ] Otimização de re-renders
- [ ] Debounce na busca

### **Acessibilidade:**
- [ ] Navegação por teclado
- [ ] Screen reader friendly
- [ ] Contraste adequado
- [ ] Foco visível

## 🚀 Entrega

### **Fase 1 - MVP (Essencial):**
- Tela principal com árvore de dados
- Modais básicos de CRUD
- Funcionalidades de criar/editar/excluir
- Layout responsivo

### **Fase 2 - Melhorias:**
- Drag & Drop para reordenação
- Busca avançada
- Importar/exportar
- Estatísticas de uso

### **Fase 3 - Otimizações:**
- Performance avançada
- Offline support
- Undo/Redo
- Audit trail

---

## 💡 Observações Técnicas

1. **combosService.ts** já está implementado com métodos de leitura
2. **Supabase** está configurado e funcional
3. **Tema** deve seguir o padrão vermelho #ea2a33
4. **Layout** deve ser consistente com as telas de munícipes já implementadas
5. **TypeScript** obrigatório para todas as interfaces
6. **React Native** com Expo Web para máxima compatibilidade

---

**🎯 Objetivo Final:** Sistema completo de administração dos cadastros básicos, permitindo configuração total da estrutura de combos do ConectaSaúde sem necessidade de acesso direto ao banco de dados.
