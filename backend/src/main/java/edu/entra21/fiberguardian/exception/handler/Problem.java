package edu.entra21.fiberguardian.exception.handler;

import java.time.OffsetDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@JsonInclude(Include.NON_NULL)
@Builder
@JsonPropertyOrder({
        "status",
        "timestamp",
        "type",
        "title",
        "detail",
        "userMessage",
        "errorObjects"
})
@Schema(name = "Problema", description = "Detalhes de um erro ocorrido na API")
public class Problem {

    @Schema(description = "HTTP status", example = "400")
    private Integer status;

    @Schema(description = "Time stamp do problema", example = "2022-12-01T18:09:02.70844Z")
    private OffsetDateTime timestamp;

    @Schema(description = "HTTP status (link)", example = "https://fiberguardian.com.br/dados-invalidos")
    private String type;

    @Schema(description = "Título problema", example = "Dados inválidos")
    private String title;

    @Schema(description = "Detalhes do problema", example = "Um ou mais campos estão inválidos. Faça o preenchimento correto e tente novamente.")
    private String detail;

    @Schema(description = "Mensagem para o usuário", example = "Um ou mais campos estão inválidos. Faça o preenchimento correto e tente novamente.")
    private String userMessage;

    @Schema(description = "Lista de objetos ou campos que geraram o erro (opcional)")
    private List<Field> errorObjects;

   // classe Field

    @Getter
    @Builder
    @JsonPropertyOrder({
            "name",
            "userMessage"
    })
    @Schema( description = "Campo ou objeto específico que gerou erro de validação")
    public static class Field {
        @Schema(description = "Nome do objeto ou campo", example = "preco")
        private String name;

        @Schema(description = "Mensagem para o usuário", example = "O preço é obrigatório")
        private String userMessage;
    }
}
