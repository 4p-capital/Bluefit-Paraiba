# 🎨 Guia Visual - Executar Scripts no Supabase

## 📱 Interface do Supabase Dashboard

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🟢 Supabase                    [Blue Desk Project]  👤 User ┃
┣━━━━━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃           │                                                 ┃
┃  🏠 Home  │  Bem-vindo ao Blue Desk                        ┃
┃           │                                                 ┃
┃  📊 Table │  ┌─────────────────────────────────────┐       ┃
┃   Editor  │  │                                     │       ┃
┃           │  │  Suas tabelas aparecem aqui         │       ┃
┃  🔐 Auth  │  │                                     │       ┃
┃           │  └─────────────────────────────────────┘       ┃
┃  💾 Store │                                                 ┃
┃           │                                                 ┃
┃ ┏━━━━━━━┓ │  👈 Você precisa clicar aqui!                  ┃
┃ ┃</> SQL┃ │                                                 ┃
┃ ┃ Editor┃ │                                                 ┃
┃ ┗━━━━━━━┛ │                                                 ┃
┃           │                                                 ┃
┃  📈 Data  │                                                 ┃
┃           │                                                 ┃
┃  ⚙️ Settings                                               ┃
┃           │                                                 ┃
┗━━━━━━━━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🎯 Passo 1: Encontre o SQL Editor

```
Onde está:
Menu Lateral Esquerdo → </> SQL Editor

┌─────────────────┐
│                 │
│  🏠 Home        │
│  📊 Table Edt   │
│  🔐 Auth        │
│  💾 Storage     │
│                 │
│  ┏━━━━━━━━━━┓  │  👈 CLIQUE AQUI
│  ┃ </> SQL   ┃  │
│  ┃  Editor   ┃  │
│  ┗━━━━━━━━━━┛  │
│                 │
│  📈 Database    │
│  ⚙️ Settings    │
│                 │
└─────────────────┘
```

---

## 📝 Passo 2: Interface do SQL Editor

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  SQL Editor                                                ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                            ┃
┃  [➕ New query]  [📁 Saved queries]  [🕐 History]         ┃
┃       👆                                                   ┃
┃   CLIQUE AQUI                                              ┃
┃                                                            ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  1 │                                                       ┃
┃  2 │  -- Cole o conteúdo do script aqui                   ┃
┃  3 │                                                       ┃
┃  4 │                                                       ┃
┃  5 │                                                       ┃
┃  6 │                                                       ┃
┃  7 │                                                       ┃
┃    │      👆 Área de edição                                ┃
┃    │                                                       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                            ┃
┃  [▶️ RUN]  [🎨 Format]  [🗑️ Clear]                        ┃
┃    👆                                                      ┃
┃  CLIQUE AQUI PARA EXECUTAR                                 ┃
┃                                                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 📂 Passo 3: Copiar o Script

### **No seu editor de código (VS Code, etc):**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  📁 Blue Desk - VS Code                                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                          ┃
┃  📁 EXPLORER                                             ┃
┃  ├── 📁 src                                              ┃
┃  ├── 📁 public                                           ┃
┃  └── 📄 supabase-schema-leads.sql     👈 ABRA ESTE      ┃
┃      📄 supabase-leads-sample-data.sql                   ┃
┃      📄 supabase-update-leads-novo.sql                   ┃
┃                                                          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  supabase-schema-leads.sql                               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 1 │ -- ===================================              ┃
┃ 2 │ -- TABELA DE LEADS - CRM                           ┃
┃ 3 │ -- ===================================              ┃
┃ 4 │                                                     ┃
┃ 5 │ CREATE TABLE IF NOT EXISTS public.leads (          ┃
┃   │   ...                                               ┃
┃   │                                                     ┃
┃   │   👆 Selecione TUDO (Ctrl+A)                        ┃
┃   │                                                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

💡 Atalhos:
   Windows/Linux: Ctrl + A (selecionar tudo)
   Mac: Cmd + A

   Windows/Linux: Ctrl + C (copiar)
   Mac: Cmd + C
```

---

## 🎬 Passo 4: Colar e Executar

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  SQL Editor - Supabase                                    ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                           ┃
┃  Passo 1: Cole aqui (Ctrl+V / Cmd+V)                     ┃
┃     👇                                                    ┃
┃ ┌─────────────────────────────────────────────────────┐  ┃
┃ │ 1 │ -- ======================================       │  ┃
┃ │ 2 │ -- TABELA DE LEADS - CRM                       │  ┃
┃ │ 3 │ -- ======================================       │  ┃
┃ │ 4 │                                                 │  ┃
┃ │ 5 │ CREATE TABLE IF NOT EXISTS public.leads (      │  ┃
┃ │ 6 │   id UUID PRIMARY KEY DEFAULT gen_random...    │  ┃
┃ │ 7 │   nome TEXT NOT NULL,                          │  ┃
┃ │   │   ...                                           │  ┃
┃ └─────────────────────────────────────────────────────┘  ┃
┃                                                           ┃
┃  Passo 2: Clique aqui para executar                      ┃
┃     👇                                                    ┃
┃  ┏━━━━━━━━━━━━━┓                                         ┃
┃  ┃  ▶️ RUN     ┃  ou pressione Ctrl+Enter / Cmd+Enter   ┃
┃  ┗━━━━━━━━━━━━━┛                                         ┃
┃                                                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## ✅ Passo 5: Verificar Sucesso

### **Mensagem de Sucesso:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Results                                                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                           ┃
┃  ✅ Success                                               ┃
┃                                                           ┃
┃  No rows returned                                         ┃
┃                                                           ┃
┃  Duration: 124ms                                          ┃
┃                                                           ┃
┃  ✅ Tabela leads criada com sucesso!                      ┃
┃  📊 Agora você pode executar o arquivo                    ┃
┃      supabase-leads-sample-data.sql                       ┃
┃                                                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🎉 SUCESSO! Próximo script →
```

### **Mensagem de Erro (exemplo):**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Results                                                  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                           ┃
┃  ❌ Error                                                 ┃
┃                                                           ┃
┃  relation "leads" already exists                          ┃
┃                                                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

💡 Isso significa que a tabela já existe!
   Pule para o próximo script.
```

---

## 🔄 Fluxo Completo (Nova Instalação)

```
┌─────────────────────────────────────────────────────────┐
│  INÍCIO                                                  │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  1️⃣ Abrir Supabase Dashboard                            │
│     https://supabase.com → Blue Desk Project            │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  2️⃣ Clicar em SQL Editor (menu lateral)                 │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  3️⃣ Clicar em "+ New query"                             │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  4️⃣ SCRIPT 1: supabase-schema-leads.sql                 │
│     • Abrir arquivo                                     │
│     • Ctrl+A → Ctrl+C                                   │
│     • Colar no editor                                   │
│     • Clicar RUN                                        │
│     ✅ Aguardar "Success"                                │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  5️⃣ Clicar em "+ New query" (nova aba)                  │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  6️⃣ SCRIPT 2: supabase-leads-sample-data.sql            │
│     • Abrir arquivo                                     │
│     • Ctrl+A → Ctrl+C                                   │
│     • Colar no editor                                   │
│     • Clicar RUN                                        │
│     ✅ Aguardar "Success - 20 rows"                      │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  7️⃣ Abrir Blue Desk → Módulo CRM                        │
│     ✅ Ver 20 leads na coluna "Novo"                     │
└─────────────────────┬───────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  🎉 CONCLUÍDO!                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Resumo Ultra-Rápido

```
1. Supabase.com → Login → Blue Desk
   ↓
2. Menu: </> SQL Editor
   ↓
3. Botão: + New query
   ↓
4. Abrir: supabase-schema-leads.sql
   ↓
5. Ctrl+A → Ctrl+C
   ↓
6. Colar no editor → RUN
   ↓
7. ✅ Success!
   ↓
8. Repetir com: supabase-leads-sample-data.sql
   ↓
9. 🎉 Pronto!
```

---

## 💡 Dicas Finais

| Situação | Solução |
|----------|---------|
| 😕 Não encontro o SQL Editor | Procure o ícone `</>` no menu lateral esquerdo |
| ⌨️ Esqueci os atalhos | Windows: `Ctrl+A`, `Ctrl+C`, `Ctrl+V`, `Ctrl+Enter` |
| ⌨️ Atalhos no Mac | `Cmd+A`, `Cmd+C`, `Cmd+V`, `Cmd+Enter` |
| ❌ Deu erro | Leia a mensagem completa e veja a seção "Erros Comuns" |
| ✅ Funcionou! | Abra o Blue Desk e vá para o módulo CRM |

---

**Tempo total:** 3-5 minutos  
**Dificuldade:** ⭐ Muito Fácil  
**Próximo passo:** Usar o CRM! 🚀
