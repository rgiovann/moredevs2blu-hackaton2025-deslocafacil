set foreign_key_checks = 0;

delete from usuario;
delete from checkpoint;
delete from deslocamento;


set foreign_key_checks = 1;

alter table usuario           auto_increment=1;
alter table checkpoint        auto_increment=1;
alter table deslocamento      auto_increment=1;

-- ============================
-- USUARIO
-- ============================
INSERT INTO usuario (
    id, nome, email, senha, telefone, ativo, role, data_cadastro
) VALUES
-- Empresa A
(1,'Ana Ribeiro','ana@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','11988887777',TRUE,'ADMIN',NOW()),
(2,'Carlos Mendes','carlos@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','11999996666',TRUE,'USUARIO',NOW()),
(3,'Beatriz Lima','beatriz@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','11977778888',TRUE,'USUARIO',NOW()),
-- Empresa B
(4, 'Fernando Alves','fernando@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','41988887777',TRUE,'ADMIN',NOW()),
(5,'Juliana Santos','juliana@deslocafacil.com','$2a$10$my8JCEHmZNTGtSI9zJoOmOA40mmTtEEFKGBydGzz6PGn.fUpVCoha','41999996666',TRUE,'USUARIO',NOW());

-- ============================
-- DESLOCAMENTOS
-- ============================
INSERT INTO deslocamento (
    id, usuario_id,
    origem_cidade, origem_estado, origem_endereco,
    destino_cidade, destino_estado, destino_endereco,
    motivo, data_saida, data_chegada_prevista,
    meio_transporte, custo_estimado, status, data_cadastro
) VALUES
-- Deslocamento 1 (Empresa A)
(1,2,'São Paulo','SP','Av. Paulista 1000','Brasília','DF','SBN Aeroporto','Reunião Federal','2025-12-04 06:00','2025-12-04 09:00','AVIAO',1200.00,'PLANEJADO',NOW()),
-- Deslocamento 2 (Empresa A)
(2,3,'Campinas','SP','Rua 15 de Novembro 200','Rio de Janeiro','RJ','Av. Atlântica 500','Visita Cliente','2025-12-06 08:00','2025-12-06 14:00','ONIBUS',300.00,'PLANEJADO',NOW()),
-- Deslocamento 3 (Empresa B, sem checkpoint intermediário)
(3,5,'Curitiba','PR','Rua XV 100','Joinville','SC','Av. Brasil 300','Entrega de Materiais','2025-12-07 07:30','2025-12-07 11:30','CARRO',200.00,'PLANEJADO',NOW());

-- ============================
-- CHECKPOINTS
-- ============================

-- Deslocamento 1 (Avião) – 3 checkpoints intermediários
INSERT INTO checkpoint (
    id, deslocamento_id, descricao, ordem_sugerida, icone, cor, localizacao, data_prevista, categoria, observacoes, data_cadastro
) VALUES
-- PARTIDA obrigatória
(1,1,'Saída do Escritório','1','building','#1E40AF','Av. Paulista 1000 - SP','2025-12-04 06:00','PARTIDA',NULL,NOW()),
-- INTERMEDIARIOS
(2,1,'Uber para Aeroporto','2','car','#F59E0B','São Paulo - SP','2025-12-04 06:20','INTERMEDIARIO',NULL,NOW()),
(3,1,'Check-in Aeroporto','3','plane','#1E3A8A','GRU Terminal 2','2025-12-04 06:40','INTERMEDIARIO',NULL,NOW()),
(4,1,'Embarque Voo 123','4','boarding','#2563EB','GRU Portão 245','2025-12-04 07:00','INTERMEDIARIO',NULL,NOW()),
-- CHEGADA obrigatória
(5,1,'Chegada e Uber para hotel','5','hotel','#10B981','Hotel Brasília Inn - DF','2025-12-04 09:40','CHEGADA',NULL,NOW());

-- Deslocamento 2 (Ônibus) – 3 checkpoints intermediários
INSERT INTO checkpoint (
    id, deslocamento_id, descricao, ordem_sugerida, icone, cor, localizacao, data_prevista, categoria, observacoes, data_cadastro
) VALUES
-- PARTIDA
(6,2,'Saída do escritório','1','building','#1E40AF','Rua 15 de Novembro 200 - Campinas','2025-12-06 08:00','PARTIDA',NULL,NOW()),
-- INTERMEDIARIOS
(7,2,'Parada para café','2','coffee','#FBBF24','Rodovia Anhanguera km 110','2025-12-06 09:30','INTERMEDIARIO',NULL,NOW()),
(8,2,'Conexão Terminal Guarulhos','3','bus','#F59E0B','Guarulhos - SP','2025-12-06 11:00','INTERMEDIARIO',NULL,NOW()),
(9,2,'Embarque ônibus executivo','4','bus','#F97316','Guarulhos - SP','2025-12-06 11:30','INTERMEDIARIO',NULL,NOW()),
-- CHEGADA
(10,2,'Chegada no cliente','5','building','#10B981','Av. Atlântica 500 - RJ','2025-12-06 14:00','CHEGADA',NULL,NOW());

-- Deslocamento 3 (Carro) – sem checkpoint intermediário
INSERT INTO checkpoint (
    id, deslocamento_id, descricao, ordem_sugerida, icone, cor, localizacao, data_prevista, categoria, observacoes, data_cadastro
) VALUES
(11,3,'Saída do escritório','1','building','#1E40AF','Rua XV 100 - Curitiba','2025-12-07 07:30','PARTIDA',NULL,NOW()),
(12,3,'Chegada no cliente','2','building','#10B981','Av. Brasil 300 - Joinville','2025-12-07 11:30','CHEGADA',NULL,NOW());


