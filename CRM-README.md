# 🎯 Módulo CRM - Blue Desk

## 📋 Visão Geral

O módulo CRM foi desenvolvido para gerenciar leads e acompanhar o funil de vendas da Bluefit. Oferece visualizações intuitivas em **Kanban** e **Lista**, além de filtros avançados e formulário completo de gestão de leads.

## ✨ Funcionalidades

### 1. **Visualizações**
- **Kanban**: Cards organizados por status com drag & drop
- **Lista**: Tabela detalhada com todas as informações
- **Cartões**: Grid premium com cards visuais e animados (RECOMENDADO!)

### 2. **Gestão de Leads**
- Criar novos leads
- Editar leads existentes
- Atualizar status via drag & drop (Kanban)
- Atribuir leads para atendentes
- Vincular leads a unidades

### 3. **Filtros e Busca**
- Busca por nome, telefone, email ou origem
- Filtro por status
- Estatísticas rápidas por status

### 4. **Status do Funil**
1. 🆕 **Novo** - Lead acabou de entrar
2. 📞 **Contato Feito** - Primeiro contato realizado
3. 📅 **Visita Agendada** - Visita marcada
4. ✅ **Visita Realizada** - Visitou a unidade
5. ❌ **Visita Cancelada** - Cancelou a visita
6. 🎉 **Matriculado** - Converteu em cliente
7. 😔 **Perdido** - Lead perdido

## 🗃️ Estrutura do Banco de Dados

### Tabela: `leads`

```sql
- id (UUID)
- nome (TEXT) *obrigatório
- telefone (TEXT) *obrigatório
- email (TEXT)
- status (TEXT) *obrigatório
- origem (TEXT)
- interesse (TEXT)
- observacoes (TEXT)
- unit_id (UUID FK → units)
- assigned_user_id (UUID FK → profiles)
- data_contato (TIMESTAMP)
- data_visita (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🚀 Como Usar

### 1. Criar a Tabela no Supabase

Execute o script SQL fornecido em `/supabase-schema-leads.sql` no SQL Editor do Supabase:

1. Acesse: https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql/new
2. Cole o conteúdo do arquivo `supabase-schema-leads.sql`
3. Execute o script
4. Verifique se a tabela foi criada com sucesso

### 2. Acessar o Módulo

1. Faça login no Blue Desk
2. Clique em **CRM** no menu lateral
3. Visualize os leads existentes ou crie novos

### 3. Criar um Novo Lead

1. Clique no botão **"+ Novo Lead"**
2. Preencha as informações:
   - Nome (obrigatório)
   - Telefone (obrigatório)
   - Email
   - Status inicial
   - Atendente responsável
   - Unidade
   - Origem do lead
   - Interesse
   - Datas de contato/visita
   - Observações
3. Clique em **"Criar Lead"**

### 4. Editar um Lead

1. Clique em qualquer lead (na lista ou no kanban)
2. Atualize as informações desejadas
3. Clique em **"Salvar"**

### 5. Mudar Status (Kanban)

1. Alterne para visualização **Kanban**
2. Arraste e solte o card do lead para a coluna desejada
3. O status será atualizado automaticamente

### 6. Filtrar Leads

- **Busca**: Digite no campo de busca para filtrar por nome, telefone, email ou origem
- **Status**: Use o dropdown de filtro para exibir apenas leads de um status específico
- **Limpar**: Selecione "Todos os status" para remover o filtro

## 🎨 Design System

O módulo segue o design premium da Bluefit:

### Cores por Status
- **Novo**: Azul (`blue-50/200/700`)
- **Contato Feito**: Roxo (`purple-50/200/700`)
- **Visita Agendada**: Âmbar (`amber-50/200/700`)
- **Visita Realizada**: Ciano (`cyan-50/200/700`)
- **Visita Cancelada**: Laranja (`orange-50/200/700`)
- **Matriculado**: Verde (`green-50/200/700`)
- **Perdido**: Vermelho (`red-50/200/700`)

### Tipografia
- Títulos: `font-bold text-2xl`
- Subtítulos: `font-semibold text-lg`
- Corpo: `text-sm`
- Labels: `text-xs font-medium`

## 📱 Responsividade

O módulo é totalmente responsivo:
- Desktop: Visualização completa com todas as colunas
- Tablet: Layout adaptado com scroll horizontal no Kanban
- Mobile: Priorização de informações essenciais

## 🔐 Permissões

### Políticas RLS Configuradas:
- ✅ **SELECT**: Todos os usuários autenticados podem visualizar leads
- ✅ **INSERT**: Todos os usuários autenticados podem criar leads
- ✅ **UPDATE**: Todos os usuários autenticados podem atualizar leads
- ⚠️ **DELETE**: Apenas administradores podem deletar leads

## 🧩 Componentes

### Arquivos Criados:
```
/src/app/components/
  ├── CRMView.tsx                    # Componente principal
  └── crm/
      ├── LeadsKanban.tsx           # Visualização Kanban
      ├── LeadsList.tsx             # Visualização Lista
      └── LeadFormDialog.tsx        # Formulário de criar/editar

/src/app/pages/
  └── CRMModule.tsx                  # Módulo exportado

/src/app/types/
  └── database.ts                    # Tipos TypeScript (atualizado)
```

## 🔄 Integrações Futuras

Planejado para próximas versões:
- [ ] Integração com WhatsApp (criar conversa a partir do lead)
- [ ] Histórico de interações
- [ ] Tarefas e follow-ups automáticos
- [ ] Relatórios de conversão
- [ ] Exportação de dados (CSV, Excel)
- [ ] Automações de status
- [ ] Notificações de leads quentes

## 🐛 Troubleshooting

### Erro: "Tabela leads não encontrada"
**Solução**: Execute o script SQL `/supabase-schema-leads.sql` no Supabase

### Leads não aparecem
**Solução**: Verifique as políticas RLS no Supabase e confirme que está autenticado

### Drag & drop não funciona
**Solução**: Certifique-se de estar na visualização Kanban e que o status é válido

### Erro ao salvar lead
**Solução**: Verifique se nome e telefone estão preenchidos (campos obrigatórios)

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---

**Blue Desk CRM** - Gerencie seus leads com eficiência e estilo! 🚀