package edu.entra21.fiberguardian.input;

import edu.entra21.fiberguardian.validation.EmailValido;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioAlteraStatusInput {
    @EmailValido
    private String email;


}
