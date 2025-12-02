package edu.entra21.fiberguardian.assembler;

import edu.entra21.fiberguardian.configuration.Mapper;
import edu.entra21.fiberguardian.input.UsuarioAlteraStatusInput;
import edu.entra21.fiberguardian.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioEmailInputDisassembler
		extends EntityInputDisassembler<UsuarioAlteraStatusInput, Usuario> {

	public UsuarioEmailInputDisassembler(Mapper mapper) {
		super(mapper);
	}

}
