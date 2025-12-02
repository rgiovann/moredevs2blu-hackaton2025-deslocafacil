package edu.entra21.fiberguardian.input;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UsuarioAlteraSeusDadosInput {

	@NotBlank(message = "Nome é obrigatório")
	@Size(max = 100, message = "Nome deve ter até 100 caracteres")
	private String nome;

	@NotBlank(message = "Telefone é obrigatório")
	@Size(max = 15, message = "Nome deve ter até 15 caracteres")
	private String telefone;

}
