package edu.entra21.fiberguardian.exception.exception;

public class EmailUsuarioNaoEncontradoException extends EntidadeNaoEncontradaException {

	private static final long serialVersionUID = 1L;

	public EmailUsuarioNaoEncontradoException(Long codUsuario) {
		super(String.format("Usuário de código %s não encontrada.", codUsuario));
	}

	public EmailUsuarioNaoEncontradoException(String msg) {
		super("Email : " + msg +" não existe.");
	}

}
