package edu.entra21.fiberguardian.exception.exception;

public abstract class EntidadeNaoEncontradaException extends NegocioException {

    private static final long serialVersionUID = 1L;

    public EntidadeNaoEncontradaException(String msg) {
        super(msg);
    }

}
