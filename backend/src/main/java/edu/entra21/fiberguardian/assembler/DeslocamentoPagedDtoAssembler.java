package edu.entra21.fiberguardian.assembler;

import edu.entra21.fiberguardian.configuration.Mapper;
import edu.entra21.fiberguardian.dto.DeslocamentoPagedDto;
import edu.entra21.fiberguardian.model.Deslocamento;
import org.springframework.stereotype.Component;

@Component
public class DeslocamentoPagedDtoAssembler extends EntitytDtoAssembler<DeslocamentoPagedDto, Deslocamento> {

    public DeslocamentoPagedDtoAssembler(Mapper mapper) {
        super(mapper);
    }

}
