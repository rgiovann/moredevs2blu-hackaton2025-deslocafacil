package edu.entra21.fiberguardian.exception.exception;

public class UsuarioSenhaIncorretaException extends NegocioException {

	private static final long serialVersionUID = 1L;

	public UsuarioSenhaIncorretaException(String msg) {
		super(msg);
	}
}
