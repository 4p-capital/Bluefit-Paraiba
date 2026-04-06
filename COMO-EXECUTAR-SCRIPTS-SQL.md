# 🚀 Como Executar Scripts SQL no Supabase

## 📋 Passo a Passo Completo

### Método 1: Via Dashboard do Supabase (Recomendado)

#### **Passo 1: Acessar o Supabase**
1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto **Blue Desk**

#### **Passo 2: Abrir o SQL Editor**
1. No menu lateral esquerdo, clique em **"SQL Editor"** (ícone de </> )
2. Você verá a interface do editor SQL

#### **Passo 3: Criar uma Nova Query**
1. Clique no botão **"New query"** (+ New query)
2. Uma nova aba será aberta com o editor vazio

#### **Passo 4: Copiar o Script**
1. Abra o arquivo que deseja executar:
   - `/supabase-schema-leads.sql` (criar tabela)
   - `/supabase-leads-sample-data.sql` (dados de exemplo)
   - `/supabase-update-leads-novo.sql` (atualizar para "novo")

2. **Copie TODO o conteúdo do arquivo**

#### **Passo 5: Colar e Executar**
1. Cole o conteúdo no SQL Editor
2. Clique no botão **"Run"** (ou pressione `Ctrl + Enter` / `Cmd + Enter`)
3. Aguarde a execução

#### **Passo 6: Verificar o Resultado**
- ✅ Se aparecer "Success" em verde = Script executado com sucesso!
- ❌ Se aparecer erro em vermelho = Leia a mensagem de erro

---

## 🎯 Ordem de Execução (Nova Instalação)

### **1º - Criar a Tabela**
```sql
-- Cole o conteúdo de: supabase-schema-leads.sql
-- Isso cria a estrutura da tabela leads
```

### **2º - Inserir Dados de Exemplo**
```sql
-- Cole o conteúdo de: supabase-leads-sample-data.sql
-- Isso adiciona 20 leads de exemplo (todos com status "novo")
```

---

## 🔄 Atualizar Leads Existentes

### **Se você já tem leads no banco**
```sql
-- Cole o conteúdo de: supabase-update-leads-novo.sql
-- Isso atualiza TODOS os leads para status "novo" e data de hoje
```

---

## 📱 Método 2: Via Terminal (Supabase CLI)

### **Pré-requisitos**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Fazer login
supabase login
```

### **Executar Scripts**
```bash
# Conectar ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Executar script
supabase db execute -f supabase-schema-leads.sql
supabase db execute -f supabase-leads-sample-data.sql
supabase db execute -f supabase-update-leads-novo.sql
```

---

## 🎬 Tutorial Visual (Dashboard)

### **Localizando o SQL Editor:**
```
Dashboard do Supabase
├── 🏠 Home
├── 📊 Table Editor
├── 🔐 Authentication
├── 💾 Storage
├── </> SQL Editor  ← CLIQUE AQUI
├── 📈 Database
└── ⚙️ Settings
```

### **Interface do SQL Editor:**
```
┌─────────────────────────────────────────────────┐
│  + New query  |  Saved queries  |  History      │
├─────────────────────────────────────────────────┤
│                                                  │
│  -- Cole o conteúdo do script aqui             │
│                                                  │
│                                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│  [RUN (Ctrl+Enter)]  [Format]  [Clear]          │
└─────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Execução

### **Para Nova Instalação:**
- [ ] Acessar Supabase Dashboard
- [ ] Abrir SQL Editor
- [ ] Executar `supabase-schema-leads.sql`
- [ ] Verificar sucesso (tabela criada)
- [ ] Executar `supabase-leads-sample-data.sql`
- [ ] Verificar sucesso (20 leads inseridos)
- [ ] Abrir o módulo CRM no Blue Desk
- [ ] Confirmar que os leads aparecem

### **Para Atualizar Leads Existentes:**
- [ ] Acessar Supabase Dashboard
- [ ] Abrir SQL Editor
- [ ] Executar `supabase-update-leads-novo.sql`
- [ ] Verificar sucesso (leads atualizados)
- [ ] Recarregar o módulo CRM
- [ ] Confirmar que todos estão em "Novo"

---

## 🆘 Solução de Problemas

### **Erro: "relation 'leads' already exists"**
✅ **Solução**: A tabela já existe! Pule para o próximo script.

### **Erro: "duplicate key value violates unique constraint"**
✅ **Solução**: Os dados já foram inseridos. Execute o script de atualização.

### **Erro: "permission denied for table leads"**
✅ **Solução**: Verifique as políticas RLS. Execute o script de schema novamente.

### **Erro: "syntax error"**
✅ **Solução**: Certifique-se de copiar TODO o conteúdo do arquivo, do início ao fim.

---

## 📞 Scripts Disponíveis

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| `supabase-schema-leads.sql` | Cria tabela e estrutura | Nova instalação |
| `supabase-leads-sample-data.sql` | Insere 20 leads de exemplo | Nova instalação / Testes |
| `supabase-update-leads-novo.sql` | Atualiza todos para "novo" | Resetar leads existentes |

---

## 💡 Dicas Importantes

1. **Sempre copie TODO o conteúdo** do arquivo SQL
2. **Execute um script por vez** para facilitar debug
3. **Leia as mensagens de sucesso** no final de cada script
4. **Faça backup** antes de executar scripts de UPDATE em produção
5. **Teste primeiro em desenvolvimento** antes de rodar em produção

---

## 🎯 Resultado Esperado

Após executar os scripts corretamente:

✅ Tabela `leads` criada com 12 colunas  
✅ 7 índices para performance  
✅ Trigger de updated_at funcionando  
✅ Políticas RLS configuradas  
✅ 20 leads de exemplo com status "novo"  
✅ Visualização Kanban mostrando todos na coluna "Novo"  

---

**Precisa de Ajuda?** Se encontrar algum erro durante a execução, copie a mensagem de erro completa para análise! 🚀
