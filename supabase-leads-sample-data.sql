-- ========================================
-- DADOS DE EXEMPLO PARA TABELA LEADS
-- ========================================
-- Execute este script APÓS criar a tabela leads
-- Este script cria 20 leads de exemplo com status "novo"

INSERT INTO public.leads (nome, telefone, email, status, origem, interesse, observacoes) VALUES
-- Todos com status "novo" (20 leads)
('João Silva', '(11) 98765-4321', 'joao.silva@email.com', 'novo', 'Instagram', 'Musculação', 'Interessado em plano semestral. Entrou em contato via direct no Instagram.'),
('Mariana Costa', '(11) 97654-3210', 'mariana.costa@email.com', 'novo', 'Google Ads', 'Yoga', 'Procura aulas de yoga para iniciantes. Disponibilidade à noite.'),
('Pedro Oliveira', '(21) 96543-2109', 'pedro.oliveira@email.com', 'novo', 'Site', 'Crossfit', 'Quer experimentar crossfit. Nunca praticou antes.'),
('Fernanda Lima', '(11) 95432-1098', 'fernanda.lima@email.com', 'novo', 'Indicação', 'Natação', 'Indicada pela cliente Ana Santos. Busca aulas de natação para adultos.'),
('Ricardo Mendes', '(11) 94321-0987', 'ricardo.mendes@email.com', 'novo', 'Facebook', 'Personal Trainer', 'Interessado em treino personalizado. Objetivo: hipertrofia.'),
('Ana Paula Santos', '(11) 93210-8765', 'ana.santos@email.com', 'novo', 'WhatsApp', 'Pilates', 'Primeiro contato a ser realizado. Demonstrou interesse via WhatsApp.'),
('Carlos Eduardo Souza', '(21) 92109-7654', 'carlos.souza@email.com', 'novo', 'Instagram', 'Musculação', 'Aguardando contato. Quer saber valores e horários disponíveis.'),
('Juliana Ferreira', '(11) 91098-6543', 'juliana.ferreira@email.com', 'novo', 'Site', 'Dança', 'Lead novo do site. Aguardando primeiro contato.'),
('Roberto Alves', '(11) 90987-5432', 'roberto.alves@email.com', 'novo', 'Google Ads', 'Natação', 'Interessado em aulas pela manhã. Aguardando contato.'),
('Camila Rodrigues', '(11) 89876-4321', 'camila.rodrigues@email.com', 'novo', 'Indicação', 'Yoga', 'Lead novo por indicação. Precisa agendar horário para conversa.'),
('Lucas Martins', '(21) 88765-3210', 'lucas.martins@email.com', 'novo', 'Facebook', 'Crossfit', 'Lead capturado pelo Facebook. Muito empolgado!'),
('Beatriz Cunha', '(11) 87654-2109', 'beatriz.cunha@email.com', 'novo', 'Site', 'Musculação', 'Lead novo do site. Quer conhecer a estrutura.'),
('Gabriel Rocha', '(11) 86543-1098', 'gabriel.rocha@email.com', 'novo', 'Instagram', 'Personal Trainer', 'Novo lead Instagram. Aguardando primeiro contato.'),
('Patrícia Gomes', '(21) 85432-0987', 'patricia.gomes@email.com', 'novo', 'Google Ads', 'Pilates', 'Lead Google Ads. Aguardando contato inicial.'),
('Thiago Barbosa', '(11) 84321-9876', 'thiago.barbosa@email.com', 'novo', 'WhatsApp', 'Natação', 'Lead WhatsApp. Pediu informações sobre aulas.'),
('Isabela Moreira', '(11) 83210-8765', 'isabela.moreira@email.com', 'novo', 'Site', 'Dança', 'Lead site. Interessada em aulas de dança contemporânea.'),
('André Carvalho', '(21) 82109-7654', 'andre.carvalho@email.com', 'novo', 'Facebook', 'Crossfit', 'Lead Facebook. Primeiro contato a realizar.'),
('Letícia Pinto', '(11) 81098-6543', 'leticia.pinto@email.com', 'novo', 'Indicação', 'Yoga', 'Lead por indicação. Aguardando contato.'),
('Bruno Dias', '(11) 80987-5432', 'bruno.dias@email.com', 'novo', 'Instagram', 'Musculação', 'Lead Instagram. Mostrou interesse em planos.'),
('Vanessa Teixeira', '(21) 79876-4321', 'vanessa.teixeira@email.com', 'novo', 'Google Ads', 'Pilates', 'Lead Google Ads. Aguardando retorno.');

-- ========================================
-- MENSAGEM DE SUCESSO
-- ========================================
-- Se este script executou sem erros, você agora tem 20 leads de exemplo com status "novo"!
-- Acesse o módulo CRM para visualizar os leads no Kanban.