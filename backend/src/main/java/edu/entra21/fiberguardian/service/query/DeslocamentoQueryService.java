package edu.entra21.fiberguardian.service.query;

import edu.entra21.fiberguardian.model.Deslocamento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DeslocamentoQueryService {
    Page<Deslocamento> consultarDeslocamentos(DeslocamentoFilter filtro, Pageable pageable );
}