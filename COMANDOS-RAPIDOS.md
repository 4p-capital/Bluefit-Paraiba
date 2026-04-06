# ⚡ Comandos Rápidos - Executar Scripts

## 🎯 Acesso Rápido

**URL:** https://supabase.com  
**Caminho:** Menu Lateral → `</> SQL Editor` → `+ New query`

---

## 📋 Nova Instalação (Executar na Ordem)

### **1. Criar Tabela**
```sql
-- Arquivo: supabase-schema-leads.sql
-- Copie TODO o conteúdo e cole no SQL Editor
-- Pressione RUN (ou Ctrl+Enter)
```

### **2. Inserir Dados**
```sql
-- Arquivo: supabase-leads-sample-data.sql
-- Copie TODO o conteúdo e cole no SQL Editor
-- Pressione RUN (ou Ctrl+Enter)
```

✅ **Pronto!** Agora você tem 20 leads no CRM.

---

## 🔄 Resetar Leads Existentes

### **Atualizar Todos para "Novo"**
```sql
-- Arquivo: supabase-update-leads-novo.sql
-- Copie TODO o conteúdo e cole no SQL Editor
-- Pressione RUN (ou Ctrl+Enter)
```

✅ **Pronto!** Todos os leads agora estão com status "novo" e data de hoje.

---

## ⌨️ Atalhos Essenciais

| Ação | Windows/Linux | Mac |
|------|---------------|-----|
| Selecionar tudo | `Ctrl + A` | `Cmd + A` |
| Copiar | `Ctrl + C` | `Cmd + C` |
| Colar | `Ctrl + V` | `Cmd + V` |
| Executar | `Ctrl + Enter` | `Cmd + Enter` |

---

## ✅ Como Verificar

### **No Supabase:**
Menu → `Table Editor` → `leads` → Deve ter registros

### **No Blue Desk:**
Módulo CRM → Visualização Kanban → Coluna "Novo" com leads

---

## 🆘 Erros Rápidos

| Erro | O que fazer |
|------|-------------|
| `relation 'leads' already exists` | Tabela já existe, pule para script 2 |
| `permission denied` | Verifique login |
| `syntax error` | Copie TODO o arquivo novamente |

---

## 📁 Localização dos Arquivos

```
Raiz do Projeto
├── supabase-schema-leads.sql           (Script 1)
├── supabase-leads-sample-data.sql      (Script 2)
└── supabase-update-leads-novo.sql      (Script 3)
```

---

## 🔢 Ordem de Execução

```
Primeira vez:
1 → 2 → Pronto!

Já tem dados:
3 → Pronto!
```

---

**⏱️ Tempo:** 2-3 minutos  
**📚 Guias completos:** Ver `GUIA-VISUAL-SUPABASE.md` e `EXECUCAO-RAPIDA.md`
