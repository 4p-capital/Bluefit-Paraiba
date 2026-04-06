# 📋 Atualização CRM - Gestão de Leads

## 🎯 Mudanças Implementadas

### 1. **Visualizações Simplificadas**
- ✅ Removida a visualização por "Cartões"
- ✅ Mantidas apenas 2 visualizações:
  - **Kanban**: Visualização em colunas por status (padrão)
  - **Lista**: Visualização em tabela

### 2. **Visualização Kanban Aprimorada**
Os cartões no Kanban agora exibem:
- ✅ **Nome do lead**
- ✅ **Telefone**
- ✅ **Email** (se disponível)
- ✅ **Origem** (Instagram, Google Ads, Site, etc.)
- ✅ **Responsável** (nome do atendente)
- ✅ **Tempo desde criação** (agora, 2h, 1d, etc.)

### 3. **Colunas do Kanban (7 Status)**
1. **Novo** - Leads que acabaram de entrar
2. **Contato Feito** - Primeiro contato realizado
3. **Visita Agendada** - Visita marcada
4. **Visita Realizada** - Visita concluída
5. **Visita Cancelada** - Visita não realizada
6. **Matriculado** - Lead convertido em cliente
7. **Perdido** - Lead não convertido

## 📦 Scripts SQL Disponíveis

### `/supabase-schema-leads.sql`
Cria a estrutura da tabela `leads` com todos os campos necessários.

```sql
-- Executar primeiro
-- Cria tabela, índices, triggers e políticas RLS
```

### `/supabase-leads-sample-data.sql`
Insere 20 leads de exemplo **todos com status "novo"**.

```sql
-- Executar após criar a tabela
-- Todos os leads começam como "novo"
```

### `/supabase-update-leads-novo.sql`
Atualiza **TODOS** os leads existentes para status "novo" e data de hoje.

```sql
-- Executar para resetar leads existentes
-- Define todos para status "novo" com data atual
```

## 🚀 Como Usar

### Opção 1: Nova Instalação
```sql
-- 1. Criar tabela
\i supabase-schema-leads.sql

-- 2. Inserir dados de exemplo
\i supabase-leads-sample-data.sql
```

### Opção 2: Atualizar Leads Existentes
```sql
-- Atualizar todos os leads para "novo"
\i supabase-update-leads-novo.sql
```

## 🎨 Interface do Usuário

### Controles Disponíveis
- **Busca**: Filtrar por nome, telefone, email ou origem
- **Filtro de Status**: Visualizar apenas leads de um status específico
- **Toggle Kanban/Lista**: Alternar entre visualizações
- **Novo Lead**: Criar novo lead manualmente

### Estatísticas em Tempo Real
Dashboard com contadores por status:
- 🔵 Novos
- 🟣 Contato Feito
- 🟠 Visita Agendada
- 🔵 Visita Realizada
- 🟠 Cancelada
- 🟢 Matriculado
- 🔴 Perdido

## 🔄 Funcionalidades Drag & Drop
- Arraste leads entre colunas para mudar o status
- Atualização automática no banco de dados
- Feedback visual durante o arrasto
- Toast de confirmação após mudança

## 📊 Campos do Lead
- **Nome** (obrigatório)
- **Telefone** (obrigatório)
- **Email** (opcional)
- **Status** (obrigatório, default: "novo")
- **Origem** (Instagram, Google, Site, etc.)
- **Interesse** (Musculação, Yoga, Natação, etc.)
- **Observações** (campo texto livre)
- **Unidade** (opcional, FK para `units`)
- **Responsável** (opcional, FK para `profiles`)
- **Data Contato** (opcional)
- **Data Visita** (opcional)

## 🎯 Próximos Passos Sugeridos
1. Configurar atribuição automática de responsáveis
2. Implementar notificações de follow-up
3. Adicionar relatórios de conversão
4. Integrar com WhatsApp para contato direto

---

**Data da Atualização**: 04/02/2026  
**Status**: ✅ Pronto para Uso
