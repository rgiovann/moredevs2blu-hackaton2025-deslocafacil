package edu.entra21.fiberguardian.service.query;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class DeslocamentoFilter {
    private LocalDate dataSaidaDeslocamentoInicio;
    private LocalDate dataSaidaDeslocamentoFim;
    private String emailUsuario;
    private String status;
}
