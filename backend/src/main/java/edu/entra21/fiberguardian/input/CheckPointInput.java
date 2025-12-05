package edu.entra21.fiberguardian.input;

import edu.entra21.fiberguardian.model.CategoriaCheckpoint;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.OffsetDateTime;

@Getter
@Setter
public class CheckPointInput {
    @NotNull(message = "O deslocamento é obrigatório.")
    @Positive(message = "O ID do deslocamento deve ser positivo.")
    private Long deslocamentoId;

    @NotBlank(message = "A descrição é obrigatória.")
    @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres.")
    private String descricao;

    @Positive(message = "A ordem sugerida deve ser positiva.")
    private Integer ordemSugerida;

    @Size(max = 50, message = "O ícone deve ter no máximo 50 caracteres.")
    private String icone;

    @Pattern(
            regexp = "^#([A-Fa-f0-9]{6})$",
            message = "A cor deve estar no formato hexadecimal, ex: #FF8800."
    )
    private String cor;

    @Size(max = 255, message = "A localização deve ter no máximo 255 caracteres.")
    private String localizacao;

    @NotNull(message = "A data prevista é obrigatória.")
    private OffsetDateTime dataPrevista;

    //@NotNull(message = "A categoria é obrigatória.")
    //private CategoriaCheckpoint categoria;

    @Size(max = 10_000, message = "O campo observações é muito longo.")
    private String observacoes;
}
