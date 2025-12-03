package edu.entra21.fiberguardian.service;

import edu.entra21.fiberguardian.exception.exception.DeslocamentoNaoEncontradoException;
import edu.entra21.fiberguardian.exception.exception.NegocioException;
import edu.entra21.fiberguardian.model.CategoriaCheckpoint;
import edu.entra21.fiberguardian.model.CheckPoint;
import edu.entra21.fiberguardian.model.Deslocamento;
import edu.entra21.fiberguardian.model.Usuario;
import edu.entra21.fiberguardian.repository.DeslocamentoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

@Service
@Transactional(readOnly = true)
public class DeslocamentoService {

    private static final Logger logger =
            LoggerFactory.getLogger(DeslocamentoService.class);

    private final DeslocamentoRepository deslocamentoRepository;
    private final UsuarioService usuarioService;
    private final CheckpointService checkpointService;
    public DeslocamentoService(
            DeslocamentoRepository deslocamentoRepository,
            UsuarioService usuarioService,
            CheckpointService checkpointService) {

        this.deslocamentoRepository = deslocamentoRepository;
        this.usuarioService = usuarioService;
        this.checkpointService = checkpointService;
    }

    // ------------------------------------------------------
    // SALVAR (POST)
    // ------------------------------------------------------
    @Transactional
    public Deslocamento salvar(Deslocamento deslocamento) {

        logger.info("[SERVICE-DESLOCAMENTO] Iniciando criação de deslocamento...");

        if (deslocamento == null) {
            logger.error("[SERVICE-DESLOCAMENTO] Payload de deslocamento é nulo.");
            throw new NegocioException("Objeto Deslocamento inválido.");
        }

        logger.debug("[SERVICE-DESLOCAMENTO] Validando usuário: {}",
                deslocamento.getUsuario().getEmail());

        Usuario usuarioValidado =
                usuarioService.buscarPorEmailObrigatorio(
                        deslocamento.getUsuario().getEmail()
                );

        deslocamento.setUsuario(usuarioValidado);

        Deslocamento deslocamentoSalvo = deslocamentoRepository.save(deslocamento);

        logger.info("[SERVICE-DESLOCAMENTO] Deslocamento criado com sucesso. ID={}",
                deslocamentoSalvo.getId());

        // ------------------------------------------------------
        // SALVA OS CHECKPOINTS OBRIGATORIOS
        // ------------------------------------------------------

        // 1. Checkpoint PARTIDA
        CheckPoint checkpointPartida = new CheckPoint();
        checkpointPartida.setDeslocamento(deslocamentoSalvo);
        checkpointPartida.setCategoria(CategoriaCheckpoint.PARTIDA);
        checkpointPartida.setOrdemSugerida(1);

         // Descrição automática
        checkpointPartida.setDescricao("Partida de " + deslocamentoSalvo.getOrigemCidade());

        // Localização: concatena origem completa
        String localizacaoOrigem = deslocamentoSalvo.getOrigemEndereco() != null
                ? deslocamentoSalvo.getOrigemEndereco() + ", " + deslocamentoSalvo.getOrigemCidade() + "/" + deslocamentoSalvo.getOrigemEstado().getSigla()
                : deslocamentoSalvo.getOrigemCidade() + "/" + deslocamentoSalvo.getOrigemEstado().getSigla();
        checkpointPartida.setLocalizacao(localizacaoOrigem);

        // Data prevista = data de saída do deslocamento
        checkpointPartida.setDataPrevista(deslocamentoSalvo.getDataSaida());

        // Dados visuais padrão
        checkpointPartida.setIcone("fa-play-circle");
        checkpointPartida.setCor("#28a745"); // verde Bootstrap

        // Observações
        checkpointPartida.setObservacoes("Checkpoint de partida criado automaticamente");

       // dataRealizada fica NULL (será preenchida no check-in)

        // 2. Checkpoint CHEGADA
        CheckPoint checkpointChegada = new CheckPoint();
        checkpointChegada.setDeslocamento(deslocamento);
        checkpointChegada.setCategoria(CategoriaCheckpoint.CHEGADA);
        checkpointChegada.setOrdemSugerida(999); // número alto para permitir intermediários

        // Descrição automática
        checkpointChegada.setDescricao("Chegada em " + deslocamentoSalvo.getDestinoCidade());

        // Localização: concatena destino completo
                String localizacaoDestino = deslocamentoSalvo.getDestinoEndereco() != null
                        ? deslocamentoSalvo.getDestinoEndereco() + ", " + deslocamentoSalvo.getDestinoCidade() + "/" + deslocamentoSalvo.getDestinoEstado().getSigla()
                        : deslocamentoSalvo.getDestinoCidade() + "/" + deslocamentoSalvo.getDestinoEstado().getSigla();
                checkpointChegada.setLocalizacao(localizacaoDestino);

        // Data prevista = data de chegada prevista do deslocamento
                checkpointChegada.setDataPrevista(deslocamentoSalvo.getDataChegadaPrevista());

        // Dados visuais padrão
                checkpointChegada.setIcone("fa-flag-checkered");
                checkpointChegada.setCor("#007bff"); // azul Bootstrap

        // Observações
                checkpointChegada.setObservacoes("Checkpoint de chegada criado automaticamente");

        // dataRealizada fica NULL (será preenchida no check-in)

        checkpointChegada.setDeslocamento(deslocamentoSalvo);
        checkpointPartida.setDeslocamento(deslocamentoSalvo);
        checkpointService.salvar(checkpointChegada);
        checkpointService.salvar(checkpointPartida);

        return deslocamentoSalvo;
    }

    // ------------------------------------------------------
    // EXCLUIR (DELETE)
    // ------------------------------------------------------
    @Transactional
    public void excluir(Long id) {

        logger.info("[SERVICE-DESLOCAMENTO] Solicitada exclusão do deslocamento ID={}",
                id);

        Deslocamento existente = deslocamentoRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("[SERVICE-DESLOCAMENTO] Deslocamento ID={} não encontrado para exclusão.", id);
                    return new DeslocamentoNaoEncontradoException(id);
                });

        deslocamentoRepository.delete(existente);
        deslocamentoRepository.flush();

        logger.info("[SERVICE-DESLOCAMENTO] Deslocamento ID={} excluído com sucesso.", id);
    }

    // ------------------------------------------------------
    // ATUALIZAR SOMENTE CUSTO REAL (PATCH)
    // ------------------------------------------------------
    @Transactional
    public Deslocamento atualizarCustoReal(Long id, BigDecimal custoReal) {

        logger.info("[SERVICE-DESLOCAMENTO] Atualização de custoReal solicitada. ID={} valor={}",
                id, custoReal);

        if (custoReal == null) {
            logger.error("[SERVICE-DESLOCAMENTO] custoReal enviado é nulo.");
            throw new NegocioException("O campo custoReal é obrigatório.");
        }

        Deslocamento existente = deslocamentoRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("[SERVICE-DESLOCAMENTO] Deslocamento ID={} não encontrado para atualização.", id);
                    return new DeslocamentoNaoEncontradoException(id);
                });

        existente.setCustoReal(custoReal);

        Deslocamento atualizado = deslocamentoRepository.save(existente);

        logger.info("[SERVICE-DESLOCAMENTO] custoReal atualizado com sucesso. ID={} novoValor={}",
                id, atualizado.getCustoReal());

        return atualizado;
    }

    public Page<Deslocamento> listarPaginado(Pageable pageable) {
        return deslocamentoRepository.findAll(pageable);
    }

    // ------------------------------------------------------
    // BUSCAR obrigatoriamente
    // ------------------------------------------------------
    public Deslocamento buscarPorIdObrigatorio(Long id) {

        logger.debug("[SERVICE-DESLOCAMENTO] Buscando deslocamento ID={}", id);

        return deslocamentoRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("[SERVICE-DESLOCAMENTO] Deslocamento ID={} não encontrado.", id);
                    return new DeslocamentoNaoEncontradoException(id);
                });
    }
}
