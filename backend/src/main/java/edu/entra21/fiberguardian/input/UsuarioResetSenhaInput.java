package edu.entra21.fiberguardian.input;

import edu.entra21.fiberguardian.validation.SenhaValida;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
public class UsuarioResetSenhaInput extends UsuarioEmailSenhaInput{

	@SenhaValida
	@ToString.Exclude
	private String repeteSenha;

}
