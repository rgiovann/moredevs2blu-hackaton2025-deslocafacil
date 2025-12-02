package edu.entra21.fiberguardian.assembler;

import org.springframework.stereotype.Component;

import edu.entra21.fiberguardian.configuration.Mapper;
import edu.entra21.fiberguardian.dto.UsuarioDto;
import edu.entra21.fiberguardian.model.Usuario;

@Component
public class UsuarioDtoAssembler extends EntitytDtoAssembler<UsuarioDto, Usuario> {

	public UsuarioDtoAssembler(Mapper mapper) {
		super(mapper);
	}

}
