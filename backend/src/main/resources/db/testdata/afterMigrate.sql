SET foreign_key_checks = 0;

DELETE FROM usuario;
DELETE FROM checkpoint;
DELETE FROM deslocamento;

SET foreign_key_checks = 1;

ALTER TABLE usuario           AUTO_INCREMENT=1;
ALTER TABLE checkpoint        AUTO_INCREMENT=1;
ALTER TABLE deslocamento      AUTO_INCREMENT=1;

-- ============================
-- USUÁRIOS
-- ============================
INSERT INTO usuario (
    id, nome, email, senha, telefone, ativo, role, data_cadastro
) VALUES
(1,'Ana Ribeiro','ana@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','11988887777',TRUE,'ADMIN',NOW()),
(2,'Carlos Mendes','carlos@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','11999996666',TRUE,'USUARIO',NOW()),
(3,'Beatriz Lima','beatriz@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','11977778888',TRUE,'USUARIO',NOW()),
(4,'Fernando Alves','fernando@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','41988887777',TRUE,'ADMIN',NOW()),
(5,'Juliana Santos','juliana@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','41999996666',TRUE,'USUARIO',NOW());

-- ============================
-- DESLOCAMENTOS
-- ============================

-- === 2 CONCLUÍDOS ===
INSERT INTO deslocamento (
    id, usuario_id,
    origem_cidade, origem_estado, origem_endereco,
    destino_cidade, destino_estado, destino_endereco,
    motivo, data_saida, data_chegada_prevista,
    meio_transporte, custo_estimado, custo_real, status, data_cadastro
) VALUES
-- Deslocamento 1: CONCLUÍDO (viagem simples sem intermediários)
(1, 2, 'São Paulo', 'SP', 'Av. Paulista 1000', 
    'Campinas', 'SP', 'Rua Barão de Jaguara 500',
    'Reunião Cliente', '2025-11-28 08:00', '2025-11-28 10:00',
    'CARRO', 150.00, 165.00, 'CONCLUIDO', '2025-11-20 10:00'),

-- Deslocamento 2: CONCLUÍDO (com intermediários, todos antes da chegada)
(2, 3, 'Curitiba', 'PR', 'Rua XV 100',
    'Ponta Grossa', 'PR', 'Av. Vicente Machado 200',
    'Auditoria Regional', '2025-11-29 07:00', '2025-11-29 10:00',
    'ONIBUS', 80.00, 85.00, 'CONCLUIDO', '2025-11-22 14:30');

-- === 2 CONCLUÍDO_COM_ATRASO ===
INSERT INTO deslocamento (
    id, usuario_id,
    origem_cidade, origem_estado, origem_endereco,
    destino_cidade, destino_estado, destino_endereco,
    motivo, data_saida, data_chegada_prevista,
    meio_transporte, custo_estimado, custo_real, status, data_cadastro
) VALUES
-- Deslocamento 3: CONCLUÍDO_COM_ATRASO (voo atrasado)
(3, 2, 'Rio de Janeiro', 'RJ', 'Aeroporto Santos Dumont',
    'Belo Horizonte', 'MG', 'Av. Afonso Pena 1500',
    'Treinamento Equipe', '2025-11-30 06:00', '2025-11-30 09:00',
    'AVIAO', 600.00, 680.00, 'CONCLUIDO_COM_ATRASO', '2025-11-25 09:00'),

-- Deslocamento 4: CONCLUÍDO_COM_ATRASO (congestionamento na estrada)
(4, 5, 'Florianópolis', 'SC', 'Rua Felipe Schmidt 100',
    'Porto Alegre', 'RS', 'Av. Borges de Medeiros 300',
    'Congresso Nacional', '2025-12-01 05:00', '2025-12-01 12:00',
    'UBER_99', 400.00, 520.00, 'CONCLUIDO_COM_ATRASO', '2025-11-28 16:00');

-- === 1 CANCELADO ===
INSERT INTO deslocamento (
    id, usuario_id,
    origem_cidade, origem_estado, origem_endereco,
    destino_cidade, destino_estado, destino_endereco,
    motivo, data_saida, data_chegada_prevista,
    meio_transporte, custo_estimado, custo_real, status, data_cadastro
) VALUES
-- Deslocamento 5: CANCELADO (iniciado mas cancelado no meio)
(5, 3, 'Brasília', 'DF', 'SBN Quadra 2',
    'Goiânia', 'GO', 'Av. Goiás 800',
    'Visita Fornecedor', '2025-12-02 08:00', '2025-12-02 11:00',
    'CARRO', 200.00, 0.00, 'CANCELADO', '2025-11-30 11:00');

-- === 3 PLANEJADOS ===
INSERT INTO deslocamento (
    id, usuario_id,
    origem_cidade, origem_estado, origem_endereco,
    destino_cidade, destino_estado, destino_endereco,
    motivo, data_saida, data_chegada_prevista,
    meio_transporte, custo_estimado, custo_real, status, data_cadastro
) VALUES
-- Deslocamento 6: PLANEJADO
(6, 2, 'São Paulo', 'SP', 'Av. Paulista 1000',
    'Brasília', 'DF', 'SBN Aeroporto',
    'Reunião Federal', '2025-12-10 06:00', '2025-12-10 09:00',
    'AVIAO', 1200.00, 0.00, 'PLANEJADO', NOW()),

-- Deslocamento 7: PLANEJADO
(7, 3, 'Manaus', 'AM', 'Av. Eduardo Ribeiro 100',
    'Belém', 'PA', 'Av. Presidente Vargas 500',
    'Expansão Regional', '2025-12-15 07:00', '2025-12-16 18:00',
    'BARCO', 800.00, 0.00, 'PLANEJADO', NOW()),

-- Deslocamento 8: PLANEJADO
(8, 4, 'Curitiba', 'PR', 'Batel Shopping',
    'São José dos Pinhais', 'PR', 'Aeroporto Afonso Pena',
    'Viagem Internacional', '2025-12-20 04:30', '2025-12-20 05:00',
    'TAXI', 80.00, 0.00, 'PLANEJADO', NOW());

-- === 3 EM_TRANSITO ===
INSERT INTO deslocamento (
    id, usuario_id,
    origem_cidade, origem_estado, origem_endereco,
    destino_cidade, destino_estado, destino_endereco,
    motivo, data_saida, data_chegada_prevista,
    meio_transporte, custo_estimado, custo_real, status, data_cadastro
) VALUES
-- Deslocamento 9: EM_TRANSITO (viagem aérea com conexão)
(9, 2, 'Salvador', 'BA', 'Aeroporto Internacional',
    'Recife', 'PE', 'Av. Boa Viagem 2000',
    'Workshop Regional', '2025-12-04 08:00', '2025-12-04 14:00',
    'AVIAO', 900.00, 0.00, 'EM_TRANSITO', '2025-12-01 10:00'),

-- Deslocamento 10: EM_TRANSITO (rota rodoviária simples)
(10, 5, 'Campinas', 'SP', 'Terminal Rodoviário',
    'São Paulo', 'SP', 'Terminal Tietê',
    'Apresentação Comercial', '2025-12-04 10:00', '2025-12-04 12:30',
    'ONIBUS', 45.00, 0.00, 'EM_TRANSITO', '2025-12-03 15:00'),

-- Deslocamento 11: EM_TRANSITO (multimodal complexo)
(11, 3, 'Vitória', 'ES', 'Centro Empresarial',
    'Rio de Janeiro', 'RJ', 'Centro - Candelária',
    'Reunião Estratégica', '2025-12-04 06:00', '2025-12-04 15:00',
    'OUTROS', 350.00, 0.00, 'EM_TRANSITO', '2025-12-02 09:00');

-- === 2 ATRASADO ===
INSERT INTO deslocamento (
    id, usuario_id,
    origem_cidade, origem_estado, origem_endereco,
    destino_cidade, destino_estado, destino_endereco,
    motivo, data_saida, data_chegada_prevista,
    meio_transporte, custo_estimado, custo_real, status, data_cadastro
) VALUES
-- Deslocamento 12: ATRASADO (voo com problemas técnicos)
(12, 4, 'Porto Alegre', 'RS', 'Aeroporto Salgado Filho',
    'São Paulo', 'SP', 'Aeroporto Congonhas',
    'Reunião Urgente', '2025-12-04 07:00', '2025-12-04 09:30',
    'AVIAO', 700.00, 0.00, 'ATRASADO', '2025-12-01 14:00'),

-- Deslocamento 13: ATRASADO (trânsito intenso)
(13, 5, 'São Paulo', 'SP', 'Zona Leste - Itaquera',
    'São Paulo', 'SP', 'Zona Sul - Vila Olímpia',
    'Entrevista Cliente', '2025-12-04 08:00', '2025-12-04 10:00',
    'UBER_99', 60.00, 0.00, 'ATRASADO', '2025-12-04 07:00');

-- ============================
-- CHECKPOINTS
-- ============================

-- === DESLOCAMENTO 1: CONCLUÍDO (sem intermediários) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor, 
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(1, 'Saída do Escritório', 1, 'building', '#1E40AF',
    'Av. Paulista 1000 - SP', NULL, '2025-11-28 08:00', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-11-20 10:00'),
(1, 'Chegada no Cliente', 2, 'building', '#10B981',
    'Rua Barão de Jaguara 500 - Campinas', NULL, '2025-11-28 09:50', 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-11-20 10:00');

-- === DESLOCAMENTO 2: CONCLUÍDO (com intermediários antes da chegada) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(2, 'Saída Terminal Rodoviário', 1, 'bus', '#1E40AF',
    'Rua XV 100 - Curitiba', NULL, '2025-11-29 07:00', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-11-22 14:30'),
(2, 'Parada para Lanche', 2, 'coffee', '#FBBF24',
    'Posto BR-376 km 85', NULL, '2025-11-29 08:15', 'INTERMEDIARIO',
    'Parada rápida 15min', '2025-11-29 08:15'),
(2, 'Chegada Auditoria', 3, 'building', '#10B981',
    'Av. Vicente Machado 200 - Ponta Grossa', NULL, '2025-11-29 09:45', 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-11-22 14:30');

-- === DESLOCAMENTO 3: CONCLUÍDO_COM_ATRASO (voo atrasado) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(3, 'Saída Aeroporto SDU', 1, 'plane', '#1E40AF',
    'Aeroporto Santos Dumont - RJ', NULL, '2025-11-30 06:00', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-11-25 09:00'),
(3, 'Check-in Realizado', 2, 'check-circle', '#F59E0B',
    'Terminal SDU', NULL, '2025-11-30 06:25', 'INTERMEDIARIO',
    'Check-in sem problemas', '2025-11-30 06:25'),
(3, 'Embarque Concluído', 3, 'boarding', '#FBBF24',
    'Portão 12 - SDU', NULL, '2025-11-30 07:00', 'INTERMEDIARIO',
    'Pronto para decolagem', '2025-11-30 07:00'),
(3, 'Voo Atrasado - Aguardando', 4, 'alert-triangle', '#EF4444',
    'Pátio de Aeronaves - SDU', NULL, '2025-11-30 10:30', 'INTERMEDIARIO',
    'Atraso de 3h30min devido problema técnico', '2025-11-30 10:30'),
(3, 'Pouso em Confins', 5, 'plane-landing', '#F97316',
    'Aeroporto Confins - BH', NULL, '2025-11-30 11:45', 'INTERMEDIARIO',
    'Desembarque realizado', '2025-11-30 11:45'),
(3, 'Chegada no Hotel', 6, 'hotel', '#10B981',
    'Av. Afonso Pena 1500 - BH', NULL, '2025-11-30 12:30', 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-11-25 09:00');

-- === DESLOCAMENTO 4: CONCLUÍDO_COM_ATRASO (congestionamento) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(4, 'Saída do Hotel', 1, 'hotel', '#1E40AF',
    'Rua Felipe Schmidt 100 - Florianópolis', NULL, '2025-12-01 05:00', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-11-28 16:00'),
(4, 'Parada Combustível', 2, 'gas-pump', '#FBBF24',
    'Posto BR-101 km 215', NULL, '2025-12-01 07:15', 'INTERMEDIARIO',
    'Abastecimento completo', '2025-12-01 07:15'),
(4, 'Almoço em Garopaba', 3, 'utensils', '#F59E0B',
    'Garopaba - SC', NULL, '2025-12-01 09:30', 'INTERMEDIARIO',
    'Parada para refeição', '2025-12-01 09:30'),
(4, 'Congestionamento Severo', 4, 'alert-circle', '#EF4444',
    'BR-101 km 310 - Divisa SC/RS', NULL, '2025-12-01 14:00', 'INTERMEDIARIO',
    'Acidente na pista - 4h parado', '2025-12-01 14:00'),
(4, 'Entrada Porto Alegre', 5, 'map-pin', '#F97316',
    'Região Metropolitana POA', NULL, '2025-12-01 15:45', 'INTERMEDIARIO',
    'Trânsito normalizado', '2025-12-01 15:45'),
(4, 'Chegada Congresso', 6, 'building', '#10B981',
    'Av. Borges de Medeiros 300 - POA', NULL, '2025-12-01 16:30', 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-11-28 16:00');

-- === DESLOCAMENTO 5: CANCELADO (com intermediários) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(5, 'Saída do Escritório', 1, 'building', '#1E40AF',
    'SBN Quadra 2 - Brasília', NULL, '2025-12-02 08:00', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-11-30 11:00'),
(5, 'Início Viagem BR-060', 2, 'car', '#F59E0B',
    'Saída de Brasília - BR-060', NULL, '2025-12-02 08:20', 'INTERMEDIARIO',
    'Viagem iniciada normalmente', '2025-12-02 08:20'),
(5, 'Parada Posto km 30', 3, 'gas-pump', '#FBBF24',
    'BR-060 km 30', NULL, '2025-12-02 08:45', 'INTERMEDIARIO',
    'Abastecimento rápido', '2025-12-02 08:45'),
(5, 'Chegada', 4, 'building', '#6B7280',
    'Av. Goiás 800 - Goiânia', NULL, NULL, 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-11-30 11:00');

-- === DESLOCAMENTO 6: PLANEJADO (somente PARTIDA e CHEGADA) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(6, 'Saída Escritório SP', 1, 'building', '#1E40AF',
    'Av. Paulista 1000 - SP', NULL, NULL, 'PARTIDA',
    'Checkpoint de partida criado automaticamente', NOW()),
(6, 'Chegada Brasília', 2, 'map-pin', '#10B981',
    'SBN Aeroporto - DF', NULL, NULL, 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', NOW());

-- === DESLOCAMENTO 7: PLANEJADO (somente PARTIDA e CHEGADA) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(7, 'Saída Porto Manaus', 1, 'anchor', '#1E40AF',
    'Av. Eduardo Ribeiro 100 - Manaus', NULL, NULL, 'PARTIDA',
    'Checkpoint de partida criado automaticamente', NOW()),
(7, 'Chegada Porto Belém', 2, 'anchor', '#10B981',
    'Av. Presidente Vargas 500 - Belém', NULL, NULL, 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', NOW());

-- === DESLOCAMENTO 8: PLANEJADO (somente PARTIDA e CHEGADA) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(8, 'Saída Shopping', 1, 'building', '#1E40AF',
    'Batel Shopping - Curitiba', NULL, NULL, 'PARTIDA',
    'Checkpoint de partida criado automaticamente', NOW()),
(8, 'Chegada Aeroporto', 2, 'plane', '#10B981',
    'Aeroporto Afonso Pena - SJP', NULL, NULL, 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', NOW());

-- === DESLOCAMENTO 9: EM_TRANSITO (com intermediários, chegada NULL) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(9, 'Saída Aeroporto Salvador', 1, 'plane', '#1E40AF',
    'Aeroporto Internacional - Salvador', NULL, '2025-12-04 08:00', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-12-01 10:00'),
(9, 'Check-in Completo', 2, 'check-circle', '#F59E0B',
    'Terminal Salvador', NULL, '2025-12-04 08:30', 'INTERMEDIARIO',
    'Documentação verificada', '2025-12-04 08:30'),
(9, 'Embarque Realizado', 3, 'boarding', '#FBBF24',
    'Portão 8 - Salvador', NULL, '2025-12-04 09:00', 'INTERMEDIARIO',
    'A bordo do voo 1234', '2025-12-04 09:00'),
(9, 'Conexão em Fortaleza', 4, 'refresh-cw', '#F97316',
    'Aeroporto Pinto Martins - Fortaleza', NULL, '2025-12-04 10:45', 'INTERMEDIARIO',
    'Aguardando voo de conexão', '2025-12-04 10:45'),
(9, 'Embarque Conexão', 5, 'plane', '#8B5CF6',
    'Portão 15 - Fortaleza', NULL, '2025-12-04 12:00', 'INTERMEDIARIO',
    'Segundo voo embarcado', '2025-12-04 12:00'),
(9, 'Chegada Hotel Recife', 6, 'hotel', '#10B981',
    'Av. Boa Viagem 2000 - Recife', NULL, NULL, 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-12-01 10:00');

-- === DESLOCAMENTO 10: EM_TRANSITO (simples, chegada NULL) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(10, 'Saída Terminal Campinas', 1, 'bus', '#1E40AF',
    'Terminal Rodoviário - Campinas', NULL, '2025-12-04 10:00', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-12-03 15:00'),
(10, 'Rodovia Bandeirantes km 45', 2, 'highway', '#F59E0B',
    'Rodovia Bandeirantes - Direção SP', NULL, '2025-12-04 10:50', 'INTERMEDIARIO',
    'Viagem transcorrendo bem', '2025-12-04 10:50'),
(10, 'Chegada Terminal Tietê', 3, 'bus', '#10B981',
    'Terminal Tietê - São Paulo', NULL, NULL, 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-12-03 15:00');

-- === DESLOCAMENTO 11: EM_TRANSITO (multimodal, chegada NULL) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(11, 'Saída Centro Empresarial', 1, 'building', '#1E40AF',
    'Centro Empresarial - Vitória', NULL, '2025-12-04 06:00', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-12-02 09:00'),
(11, 'Uber para Rodoviária', 2, 'car', '#F59E0B',
    'Terminal Rodoviário - Vitória', NULL, '2025-12-04 06:25', 'INTERMEDIARIO',
    'Translado para terminal', '2025-12-04 06:25'),
(11, 'Ônibus para Cachoeiro', 3, 'bus', '#FBBF24',
    'BR-101 Sul', NULL, '2025-12-04 09:45', 'INTERMEDIARIO',
    'Primeira etapa rodoviária', '2025-12-04 09:45'),
(11, 'Troca de Ônibus Cachoeiro', 4, 'refresh-cw', '#F97316',
    'Terminal Cachoeiro de Itapemirim', NULL, '2025-12-04 10:15', 'INTERMEDIARIO',
    'Conexão para o Rio', '2025-12-04 10:15'),
(11, 'Ônibus Executivo RJ', 5, 'bus', '#8B5CF6',
    'BR-101 Norte', NULL, '2025-12-04 13:30', 'INTERMEDIARIO',
    'Última etapa rodoviária', '2025-12-04 13:30'),
(11, 'Chegada Escritório Centro', 6, 'building', '#10B981',
    'Centro - Candelária - RJ', NULL, NULL, 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-12-02 09:00');

-- === DESLOCAMENTO 12: ATRASADO (intermediário após chegada prevista) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(12, 'Saída para Aeroporto', 1, 'car', '#1E40AF',
    'Hotel - Porto Alegre', NULL, '2025-12-04 05:30', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-12-01 14:00'),
(12, 'Check-in Aeroporto', 2, 'check-circle', '#F59E0B',
    'Aeroporto Salgado Filho - POA', NULL, '2025-12-04 06:10', 'INTERMEDIARIO',
    'Check-in realizado', '2025-12-04 06:10'),
(12, 'Embarque Autorizado', 3, 'boarding', '#FBBF24',
    'Portão 20 - POA', NULL, '2025-12-04 07:00', 'INTERMEDIARIO',
    'Pronto para embarque', '2025-12-04 07:00'),
(12, 'ATRASO - Manutenção', 4, 'alert-triangle', '#EF4444',
    'Pátio de Aeronaves - POA', NULL, '2025-12-04 11:00', 'INTERMEDIARIO',
    'Atraso de 4h por problemas técnicos na aeronave', '2025-12-04 11:00'),
(12, 'Chegada Congonhas', 5, 'plane', '#10B981',
    'Aeroporto Congonhas - SP', NULL, NULL, 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-12-01 14:00');

-- === DESLOCAMENTO 13: ATRASADO (congestionamento após horário previsto) ===
INSERT INTO checkpoint (
    deslocamento_id, descricao, ordem_sugerida, icone, cor,
    localizacao, data_prevista, data_realizada, categoria, observacoes, data_cadastro
) VALUES
(13, 'Saída Itaquera', 1, 'home', '#1E40AF',
    'Zona Leste - Itaquera - SP', NULL, '2025-12-04 08:00', 'PARTIDA',
    'Checkpoint de partida criado automaticamente', '2025-12-04 07:00'),
(13, 'Marginal Tietê', 2, 'car', '#F59E0B',
    'Marginal Tietê - SP', NULL, '2025-12-04 08:40', 'INTERMEDIARIO',
    'Trânsito moderado', '2025-12-04 08:40'),
(13, 'CONGESTIONAMENTO Ponte', 3, 'alert-circle', '#EF4444',
    'Ponte Cidade Jardim - SP', NULL, '2025-12-04 11:15', 'INTERMEDIARIO',
    'Congestionamento severo 10km - perda de 2h30min', '2025-12-04 11:15'),
(13, 'Chegada Vila Olímpia', 4, 'building', '#10B981',
    'Zona Sul - Vila Olímpia - SP', NULL, NULL, 'CHEGADA',
    'Checkpoint de chegada criado automaticamente', '2025-12-04 07:00');