package edu.entra21.fiberguardian.assembler;

import edu.entra21.fiberguardian.configuration.Mapper;
import edu.entra21.fiberguardian.input.DeslocamentoInput;
import edu.entra21.fiberguardian.model.Deslocamento;
import org.springframework.stereotype.Component;

@Component
public class DeslocamentoInputDisassembler extends EntityInputDisassembler<DeslocamentoInput, Deslocamento>{

    public DeslocamentoInputDisassembler(Mapper mapper) {
        super(mapper);
    }
}
