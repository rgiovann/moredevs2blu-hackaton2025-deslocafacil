package edu.entra21.fiberguardian.input;

import edu.entra21.fiberguardian.model.MeioTransporte;
import edu.entra21.fiberguardian.model.StatusDeslocamento;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Setter
@Getter
public class DeslocamentoEdicaoInput {
    @DecimalMin(value = "0.0", inclusive = true, message = "Custo Real deve ser >= 0.")
    private BigDecimal custoReal;

    @NotNull(message = "O status do deslocamento é obrigatório.")
    @Enumerated(EnumType.STRING)
    private StatusDeslocamento status;
}
