package edu.entra21.fiberguardian.exception.handler;

import lombok.Getter;

@Getter
public enum ProblemType {
    RECURSO_NAO_ENCONTRADO("recurso-nao-encontrado","Recurso não encontrado"),
    PROBLEMA_NA_REQUISICAO("problema-na-requisicao","Violação de regra de negócio"),
    MENSAGEM_CORROMPIDA("mensagem-corrompida","Mensagem corrompida"),
    ENTIDADE_EM_USO("entidade-em-uso","Entidade em uso"),
    ERRO_DO_SISTEMA("erro-do-sistema","Erro do sistema"),
    PARAMETRO_INVALIDO("parametro-invalido","Parâmetro inválido"),
    DADOS_INVALIDO("dado-invalido","Dado inválido"),
    USUARIO_NAO_AUTORIZADO("erro-credenciais-invalidas", "Credenciais inválidas");


    private String title;
    private String uri;

    private ProblemType(String path, String title) {
        this.title = title;
        this.uri = "https://fiberguardian.com.br/" + path;
    }


}
