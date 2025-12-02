package edu.entra21.fiberguardian.input;

import edu.entra21.fiberguardian.validation.EmailValido;
import edu.entra21.fiberguardian.validation.SenhaValida;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
public class UsuarioEmailSenhaInput {

	@EmailValido
	private String email;

	@SenhaValida
	@ToString.Exclude
	private String senha;

}
