package edu.entra21.fiberguardian.input;

import edu.entra21.fiberguardian.validation.SenhaValida;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
public class UsuarioAlteraSenhaInput {

	@SenhaValida
	@ToString.Exclude
	private String senhaAtual;

	@SenhaValida
	@ToString.Exclude
	private String novaSenha;

	@SenhaValida
	@ToString.Exclude
	private String repeteNovaSenha;

}
