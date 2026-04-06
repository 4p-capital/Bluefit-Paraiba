# ⚡ Execução Rápida - Scripts SQL

## 🎯 Guia Express (5 minutos)

### 📍 **Você Está Aqui:**
Você tem 3 arquivos SQL prontos no projeto:
- ✅ `/supabase-schema-leads.sql`
- ✅ `/supabase-leads-sample-data.sql`
- ✅ `/supabase-update-leads-novo.sql`

---

## 🚀 Como Executar (Passo a Passo Visual)

### **1️⃣ Abra o Supabase**
```
🌐 https://supabase.com
   ↓
👤 Faça Login
   ↓
📁 Selecione projeto "Blue Desk"
```

### **2️⃣ Vá para o SQL Editor**
```
Menu Lateral Esquerdo
   ↓
Clique em: </> SQL Editor
   ↓
Clique em: + New query
```

### **3️⃣ Execute os Scripts**

#### **OPÇÃO A: Nova Instalação (Nunca rodou antes)**

**Script 1 - Criar Tabela:**
```
1. Abra: supabase-schema-leads.sql
2. Selecione TODO o texto (Ctrl+A)
3. Copie (Ctrl+C)
4. Cole no SQL Editor (Ctrl+V)
5. Clique em RUN (ou Ctrl+Enter)
6. ✅ Aguarde "Success"
```

**Script 2 - Dados de Exemplo:**
```
1. Clique em + New query (nova aba)
2. Abra: supabase-leads-sample-data.sql
3. Selecione TODO o texto (Ctrl+A)
4. Copie (Ctrl+C)
5. Cole no SQL Editor (Ctrl+V)
6. Clique em RUN (ou Ctrl+Enter)
7. ✅ Aguarde "Success - 20 rows inserted"
```

---

#### **OPÇÃO B: Atualizar Leads Existentes (Já tem dados)**

**Script - Atualizar para Novo:**
```
1. Abra: supabase-update-leads-novo.sql
2. Selecione TODO o texto (Ctrl+A)
3. Copie (Ctrl+C)
4. Cole no SQL Editor (Ctrl+V)
5. Clique em RUN (ou Ctrl+Enter)
6. ✅ Aguarde "Success - X rows updated"
```

---

## 🎬 Atalhos do Teclado

| Ação | Windows/Linux | Mac |
|------|---------------|-----|
| Selecionar Tudo | `Ctrl + A` | `Cmd + A` |
| Copiar | `Ctrl + C` | `Cmd + C` |
| Colar | `Ctrl + V` | `Cmd + V` |
| Executar SQL | `Ctrl + Enter` | `Cmd + Enter` |

---

## ✅ Como Saber se Funcionou?

### **Após Executar:**

1. **Mensagem de Sucesso:**
   ```
   ✅ Success. No rows returned
   ou
   ✅ Success. 20 rows returned
   ```

2. **Verificar no Table Editor:**
   ```
   Menu Lateral → Table Editor → leads
   ```
   - Deve aparecer a tabela `leads`
   - Deve ter 20 registros
   - Todos com status = "novo"

3. **Verificar no Blue Desk:**
   ```
   Abra o sistema Blue Desk
   ↓
   Vá para módulo CRM
   ↓
   Visualização Kanban
   ↓
   Coluna "Novo" deve ter 20 leads
   ```

---

## 🆘 Erros Comuns

### ❌ **"relation 'leads' already exists"**
**O que significa:** Tabela já foi criada antes  
**Solução:** Pule o script 1, vá direto para o script 2 ou 3

### ❌ **"permission denied"**
**O que significa:** Problema de acesso  
**Solução:** Verifique se está logado com o usuário correto

### ❌ **"syntax error"**
**O que significa:** Erro ao copiar o código  
**Solução:** Copie TODO o arquivo novamente, do início ao fim

---

## 📋 Resumo dos Scripts

| # | Arquivo | O que faz | Quando usar |
|---|---------|-----------|-------------|
| 1 | `supabase-schema-leads.sql` | Cria a tabela | Primeira vez |
| 2 | `supabase-leads-sample-data.sql` | Insere 20 leads | Primeira vez / Testes |
| 3 | `supabase-update-leads-novo.sql` | Muda todos para "novo" | Resetar dados |

---

## 🎯 Próximo Passo

Após executar os scripts com sucesso:

```
✅ Scripts executados
   ↓
🌐 Abra o Blue Desk
   ↓
📊 Acesse o módulo CRM
   ↓
👀 Visualize os 20 leads na coluna "Novo"
   ↓
🎉 Comece a usar!
```

---

## 💡 Dica Pro

**Salve suas queries no Supabase:**
1. Após executar com sucesso
2. Clique no ícone de "salvar" (💾)
3. Dê um nome: "Blue Desk - Schema Leads"
4. Terá acesso rápido depois!

---

**Tempo estimado:** 3-5 minutos  
**Dificuldade:** ⭐ Fácil  
**Precisa de ajuda?** Copie e cole qualquer mensagem de erro! 🚀
