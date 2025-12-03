package edu.entra21.fiberguardian.service;

import edu.entra21.fiberguardian.exception.exception.NegocioException;
import edu.entra21.fiberguardian.model.CheckPoint;
import edu.entra21.fiberguardian.repository.CheckpointRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CheckpointService {

    private static final Logger logger =
            LoggerFactory.getLogger(CheckpointService.class);

    private final CheckpointRepository checkpointRepository;

    public CheckpointService(CheckpointRepository checkpointRepository) {
        this.checkpointRepository = checkpointRepository;
    }

    @Transactional
    public CheckPoint salvar(CheckPoint checkPoint) {

        logger.info("[SERVICE-CHECKPOINT] Salvando checkpoint...");

        if (checkPoint == null) {
            logger.error("[SERVICE-CHECKPOINT] Payload de checkpoint é nulo.");
            throw new NegocioException("Objeto Checkpoint inválido.");
        }

        return checkpointRepository.save(checkPoint);
    }
}