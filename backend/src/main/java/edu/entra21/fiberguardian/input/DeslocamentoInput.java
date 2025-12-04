package edu.entra21.fiberguardian.input;


import edu.entra21.fiberguardian.model.MeioTransporte;
import edu.entra21.fiberguardian.validation.EmailValido;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Setter
@Getter
public class DeslocamentoInput {

    // --- RELACIONAMENTO (email do usuário) -------------------------

    @NotBlank(message = "O campo 'usuario' (email) é obrigatório.")
    @EmailValido
    private String usuario;

    // --- ORIGEM ----------------------------------------------------

    @NotBlank(message = "Origem - Cidade é obrigatória.")
    @Size(max = 100, message = "Origem - Cidade deve ter até 100 caracteres.")
    private String origemCidade;

    @NotBlank(message = "Origem - Estado é obrigatório.")
    @Size(min = 2, max = 2, message = "Origem - Estado deve conter 2 caracteres (UF).")
    private String origemEstado;

    @NotBlank(message = "Origem - Endereço é obrigatório.")
    @Size(max = 255, message = "Origem - Endereço deve ter até 255 caracteres.")
    private String origemEndereco;

    // --- DESTINO ---------------------------------------------------

    @NotBlank(message = "Destino - Cidade é obrigatória.")
    @Size(max = 100, message = "Destino - Cidade deve ter até 100 caracteres.")
    private String destinoCidade;

    @NotBlank(message = "Destino - Estado é obrigatório.")
    @Size(min = 2, max = 2, message = "Destino - Estado deve conter 2 caracteres (UF).")
    private String destinoEstado;

    @NotBlank(message = "Destino - Endereço é obrigatório.")
    @Size(max = 255, message = "Destino - Endereço deve ter até 255 caracteres.")
    private String destinoEndereco;

    // --- DADOS DO DESLOCAMENTO ------------------------------------

    @NotBlank(message = "O motivo do deslocamento é obrigatório.")
    @Size(max = 255, message = "Motivo deve ter até 255 caracteres.")
    private String motivo;

    @NotNull(message = "A Data de Saída é obrigatória.")
    private OffsetDateTime dataSaida;

    @NotNull(message = "A Data de Chegada Prevista é obrigatória.")
    private OffsetDateTime dataChegadaPrevista;

    // --- ENUM MEIO DE TRANSPORTE ----------------------------------

    @NotNull(message = "O Meio de Transporte é obrigatório.")
    @Enumerated(EnumType.STRING)
    private MeioTransporte meioTransporte;

    // --- CUSTOS ----------------------------------------------------

    @DecimalMin(value = "0.0", inclusive = true, message = "Custo Estimado deve ser >= 0.")
    private BigDecimal custoEstimado;

    @DecimalMin(value = "0.0", inclusive = true, message = "Custo Real deve ser >= 0.")
    private BigDecimal custoReal;

    // --- OBSERVAÇÕES ----------------------------------------------

    private String observacoes;
}