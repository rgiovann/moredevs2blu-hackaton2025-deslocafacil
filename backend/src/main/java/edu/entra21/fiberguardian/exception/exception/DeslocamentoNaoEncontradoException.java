package edu.entra21.fiberguardian.exception.exception;

public class DeslocamentoNaoEncontradoException extends EntidadeNaoEncontradaException {

	private static final long serialVersionUID = 1L;

	public DeslocamentoNaoEncontradoException(Long idDeslocamento) {
		super(String.format("Deslocamento de código %d não encontrada.", idDeslocamento));
	}

	public DeslocamentoNaoEncontradoException(String msg) {
		super("Deslocamento : " + msg +" não existe.");
	}

}
