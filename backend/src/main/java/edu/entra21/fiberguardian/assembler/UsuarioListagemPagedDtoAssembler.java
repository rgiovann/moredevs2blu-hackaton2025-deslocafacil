package edu.entra21.fiberguardian.assembler;

import edu.entra21.fiberguardian.dto.UsuarioListagemPagedDto;
import org.springframework.stereotype.Component;

import edu.entra21.fiberguardian.configuration.Mapper;
import edu.entra21.fiberguardian.model.Usuario;

@Component
public class UsuarioListagemPagedDtoAssembler extends EntitytDtoAssembler<UsuarioListagemPagedDto, Usuario> {

	public UsuarioListagemPagedDtoAssembler(Mapper mapper) {
		super(mapper);
	}

}
