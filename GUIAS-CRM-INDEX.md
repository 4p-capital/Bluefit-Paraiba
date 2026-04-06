# 📚 Índice de Guias - CRM Blue Desk

## 🎯 Escolha Seu Guia

Selecione o guia que melhor se adapta ao seu perfil:

---

### ⚡ **Para Quem Tem Pressa**
📄 **[COMANDOS-RAPIDOS.md](./COMANDOS-RAPIDOS.md)**
- ⏱️ Tempo de leitura: 1 minuto
- 🎯 Direto ao ponto
- ✅ Apenas os comandos essenciais
- 👥 **Recomendado para:** Quem já conhece Supabase

---

### 🚀 **Para Iniciantes**
📄 **[EXECUCAO-RAPIDA.md](./EXECUCAO-RAPIDA.md)**
- ⏱️ Tempo de leitura: 3-5 minutos
- 📋 Passo a passo detalhado
- 🎯 Inclui troubleshooting
- 👥 **Recomendado para:** Primeira vez no Supabase

---

### 🎨 **Para Quem Prefere Visual**
📄 **[GUIA-VISUAL-SUPABASE.md](./GUIA-VISUAL-SUPABASE.md)**
- ⏱️ Tempo de leitura: 5 minutos
- 🖼️ Diagramas ASCII e ilustrações
- 🎯 Interface visual completa
- 👥 **Recomendado para:** Aprendizes visuais

---

### 📖 **Para Quem Quer Entender Tudo**
📄 **[COMO-EXECUTAR-SCRIPTS-SQL.md](./COMO-EXECUTAR-SCRIPTS-SQL.md)**
- ⏱️ Tempo de leitura: 10 minutos
- 📚 Guia completo e detalhado
- 🎯 Múltiplos métodos (Dashboard + CLI)
- 👥 **Recomendado para:** Desenvolvedores

---

### 📊 **Sobre as Atualizações**
📄 **[CRM-ATUALIZACAO-STATUS.md](./CRM-ATUALIZACAO-STATUS.md)**
- ⏱️ Tempo de leitura: 5 minutos
- 📋 Changelog completo
- 🎯 Mudanças implementadas
- 👥 **Recomendado para:** Equipe técnica

---

## 🗂️ Arquivos SQL Disponíveis

### **1. Schema da Tabela**
📄 `supabase-schema-leads.sql`
- Cria a tabela `leads`
- Define índices e constraints
- Configura RLS e triggers
- **Executar:** Primeira vez

### **2. Dados de Exemplo**
📄 `supabase-leads-sample-data.sql`
- Insere 20 leads de exemplo
- Todos com status "novo"
- **Executar:** Primeira vez ou para testes

### **3. Atualização de Status**
📄 `supabase-update-leads-novo.sql`
- Atualiza todos leads existentes
- Define status = "novo"
- Define data = hoje
- **Executar:** Para resetar dados

---

## 🎯 Fluxo Recomendado

### **Cenário 1: Primeira Instalação**
```
1. Leia: EXECUCAO-RAPIDA.md
2. Execute: supabase-schema-leads.sql
3. Execute: supabase-leads-sample-data.sql
4. Acesse: Blue Desk → CRM
```

### **Cenário 2: Já Tem Leads no Banco**
```
1. Leia: COMANDOS-RAPIDOS.md
2. Execute: supabase-update-leads-novo.sql
3. Recarregue: Blue Desk → CRM
```

### **Cenário 3: Dúvidas ou Erros**
```
1. Leia: COMO-EXECUTAR-SCRIPTS-SQL.md
2. Veja seção "Solução de Problemas"
3. Execute o script novamente
```

---

## 🆘 Precisa de Ajuda?

### **Erro durante execução?**
1. Leia a mensagem de erro completa
2. Consulte: `COMO-EXECUTAR-SCRIPTS-SQL.md` → Seção "Solução de Problemas"
3. Verifique se copiou TODO o conteúdo do arquivo

### **Interface diferente?**
1. Consulte: `GUIA-VISUAL-SUPABASE.md`
2. Veja os diagramas da interface
3. Certifique-se de estar no projeto correto

### **Resultado não aparece?**
1. Verifique: Supabase → Table Editor → `leads`
2. Recarregue: Blue Desk (F5)
3. Limpe cache do navegador

---

## ✅ Checklist de Instalação

### **Antes de Começar**
- [ ] Acesso ao Supabase
- [ ] Projeto "Blue Desk" selecionado
- [ ] Arquivos SQL baixados/acessíveis
- [ ] Editor de código aberto (VS Code, etc)

### **Durante a Execução**
- [ ] SQL Editor aberto
- [ ] Script copiado COMPLETAMENTE
- [ ] RUN clicado
- [ ] Mensagem "Success" recebida

### **Após Execução**
- [ ] Tabela `leads` criada (verificar Table Editor)
- [ ] Dados inseridos (verificar registros)
- [ ] Blue Desk recarregado
- [ ] CRM mostrando leads

---

## 📋 Estrutura da Tabela Leads

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | Sim | ID único (gerado automaticamente) |
| `nome` | TEXT | Sim | Nome do lead |
| `telefone` | TEXT | Sim | Telefone do lead |
| `email` | TEXT | Não | Email do lead |
| `status` | TEXT | Sim | Status atual (default: "novo") |
| `origem` | TEXT | Não | Origem do lead |
| `interesse` | TEXT | Não | Área de interesse |
| `observacoes` | TEXT | Não | Observações gerais |
| `unit_id` | UUID | Não | ID da unidade |
| `assigned_user_id` | UUID | Não | ID do responsável |
| `data_contato` | TIMESTAMP | Não | Data do primeiro contato |
| `data_visita` | TIMESTAMP | Não | Data da visita |
| `created_at` | TIMESTAMP | Sim | Data de criação |
| `updated_at` | TIMESTAMP | Sim | Data de atualização |

---

## 🎨 Status Disponíveis

| Status | Cor | Descrição |
|--------|-----|-----------|
| `novo` | 🔵 Azul | Lead recém-chegado |
| `contato_feito` | 🟣 Roxo | Primeiro contato realizado |
| `visita_agendada` | 🟠 Laranja | Visita marcada |
| `visita_realizada` | 🔵 Ciano | Visita concluída |
| `visita_cancelada` | 🟠 Laranja | Visita não realizada |
| `matriculado` | 🟢 Verde | Convertido em cliente |
| `perdido` | 🔴 Vermelho | Lead perdido |

---

## 🔗 Links Rápidos

| Recurso | Link |
|---------|------|
| Supabase Dashboard | https://supabase.com |
| Blue Desk (local) | http://localhost:5173 |
| SQL Editor | Supabase → Menu → `</> SQL Editor` |
| Table Editor | Supabase → Menu → `📊 Table Editor` |

---

## 💡 Dicas Importantes

✅ **Sempre copie TODO o conteúdo** do arquivo SQL  
✅ **Execute um script por vez** para facilitar debug  
✅ **Leia as mensagens** após executar cada script  
✅ **Faça backup** antes de executar em produção  
✅ **Teste primeiro** em ambiente de desenvolvimento  

---

## 🎯 Suporte

**Precisa de ajuda?**
- 📖 Leia os guias na ordem de complexidade
- 🔍 Use Ctrl+F para buscar termos específicos
- 💬 Copie mensagens de erro completas
- 🆘 Consulte a seção "Solução de Problemas"

---

**Última atualização:** 04/02/2026  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Uso
