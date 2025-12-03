package edu.entra21.fiberguardian.dto;

import edu.entra21.fiberguardian.model.Estado;
import edu.entra21.fiberguardian.model.MeioTransporte;
import edu.entra21.fiberguardian.model.StatusDeslocamento;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
@Setter
@Getter
public class DeslocamentoDto {
    private String emailUsuario;
    private String origemCidade;
    private Estado origemEstado;
    private String destinoCidade;
    private Estado destinoEstado;
    private String destinoEndereco;
    private String motivo;
    private OffsetDateTime dataSaida;
    private OffsetDateTime dataChegadaPrevista;
    private OffsetDateTime dataChegadaReal;
    private MeioTransporte meioTransporte;
    private BigDecimal custoEstimado;
    private BigDecimal custoReal;
    private StatusDeslocamento status;
    private String observacoes;
}
