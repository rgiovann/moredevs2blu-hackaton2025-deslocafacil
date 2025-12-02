package edu.entra21.fiberguardian.dto;

import edu.entra21.fiberguardian.model.Role;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UsuarioListagemPagedDto {

	private String nome;
	private String email;
	private String telefone;
	private Role role;
	private Boolean ativo;
}