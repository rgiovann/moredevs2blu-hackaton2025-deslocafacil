package edu.entra21.fiberguardian.assembler;

import edu.entra21.fiberguardian.configuration.Mapper;
import edu.entra21.fiberguardian.dto.DeslocamentoDto;
import edu.entra21.fiberguardian.model.Deslocamento;
import org.springframework.stereotype.Component;

@Component
public class DeslocamentoDtoAssembler extends EntitytDtoAssembler<DeslocamentoDto, Deslocamento> {

    public DeslocamentoDtoAssembler(Mapper mapper) {
        super(mapper);
    }

}
