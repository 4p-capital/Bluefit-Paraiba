# 🚀 Guia Rápido - Instalação do CRM

## ⚡ Passo a Passo (5 minutos)

### 1️⃣ Criar a Tabela no Supabase

1. Acesse seu projeto no Supabase:
   ```
   https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql/new
   ```

2. Copie TODO o conteúdo do arquivo `/supabase-schema-leads.sql`

3. Cole no SQL Editor do Supabase

4. Clique em **RUN** (ou pressione Ctrl+Enter)

5. ✅ Aguarde a confirmação: "Success. No rows returned"

### 2️⃣ Popular com Dados de Exemplo (OPCIONAL)

1. No mesmo SQL Editor, limpe o conteúdo

2. Copie TODO o conteúdo do arquivo `/supabase-leads-sample-data.sql`

3. Cole no SQL Editor

4. Clique em **RUN**

5. ✅ 20 leads de exemplo serão criados!

### 3️⃣ Acessar o CRM

1. Volte para o Blue Desk

2. Faça login (se não estiver logado)

3. Clique no menu **CRM** na barra lateral

4. 🎉 Pronto! Você verá seus leads em cartões lindos!

---

## 🔧 Troubleshooting Rápido

### ❌ Erro: "relation 'public.leads' does not exist"
**Solução**: Execute o script `/supabase-schema-leads.sql`

### ❌ Erro: "permission denied for table leads"
**Solução**: Verifique se você está logado no Blue Desk

### ❌ Tela de CRM vazia
**Solução**: 
1. Execute o script de dados de exemplo
2. OU clique em "Novo Lead" para criar manualmente

### ❌ Erro de Foreign Key (FK)
**Solução**: Normal! A tabela foi criada sem FKs propositalmente. O sistema funciona perfeitamente assim.

---

## 📊 Visualizações Disponíveis

Clique nos botões no topo para alternar entre:

- **🎴 Cartões** (Padrão) - Visual moderno com cards animados
- **📊 Kanban** - Arraste e solte entre colunas
- **📋 Lista** - Tabela completa com todos os dados

---

## 🎯 Próximas Ações

Após a instalação, você pode:

1. ✅ **Criar leads** - Botão "+ Novo Lead"
2. ✅ **Filtrar** - Por status ou busca
3. ✅ **Editar** - Clique em qualquer lead
4. ✅ **Mudar status** - Arraste no Kanban
5. ✅ **Atribuir** - Vincule a atendentes e unidades

---

**Tempo total**: ~5 minutos ⏱️

**Dificuldade**: Iniciante 👶

**Resultado**: CRM profissional funcionando! 🚀
