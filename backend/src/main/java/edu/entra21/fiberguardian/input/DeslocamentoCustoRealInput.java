package edu.entra21.fiberguardian.input;

import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Setter
@Getter
public class DeslocamentoCustoRealInput {
    @DecimalMin(value = "0.0", inclusive = true, message = "Custo Real deve ser >= 0.")
    private BigDecimal custoReal;
}
