package edu.entra21.fiberguardian.input;

import edu.entra21.fiberguardian.model.Role;
import edu.entra21.fiberguardian.validation.EmailValido;
import edu.entra21.fiberguardian.validation.SenhaValida;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
public class UsuarioaAdicionaNovoUsuarioInput {

	@NotBlank(message = "Nome é obrigatório")
	@Size(max = 100, message = "Nome deve ter até 100 caracteres")
	private String nome;

	@EmailValido
	private String email;

	@NotNull(message = "Role é obrigatória")
	@Enumerated(EnumType.STRING)
	private Role role;

	@SenhaValida
	@ToString.Exclude
	private String senha;

	@SenhaValida
	@ToString.Exclude
	private String repeteSenha;

}
