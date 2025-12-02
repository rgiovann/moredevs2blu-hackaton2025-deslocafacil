package edu.entra21.fiberguardian.assembler;

import edu.entra21.fiberguardian.input.UsuarioaAdicionaNovoUsuarioInput;
import org.springframework.stereotype.Component;

import edu.entra21.fiberguardian.configuration.Mapper;
import edu.entra21.fiberguardian.model.Usuario;

@Component
public class UsuarioNovoInputDisassembler
		extends EntityInputDisassembler<UsuarioaAdicionaNovoUsuarioInput, Usuario> {

	public UsuarioNovoInputDisassembler(Mapper mapper) {
		super(mapper);
	}

}
