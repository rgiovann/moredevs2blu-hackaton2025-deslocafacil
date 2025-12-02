package edu.entra21.fiberguardian.model;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@Table(name = "deslocamento")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class Deslocamento {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- RELACIONAMENTO ------------------------------------------------------

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_deslocamento_usuario"))
    private Usuario usuario;

    // --- LOCAIS --------------------------------------------------------------

    @Column(name = "origem_cidade", nullable = false, length = 100)
    private String origemCidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "origem_estado", columnDefinition = "char(2)")
    private Estado origemEstado;

    @Column(name = "origem_endereco", length = 255)
    private String origemEndereco;

    @Column(name = "destino_cidade", nullable = false, length = 100)
    private String destinoCidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "destino_estado", columnDefinition = "char(2)")
    private Estado destinoEstado;

    @Column(name = "destino_endereco", length = 255)
    private String destinoEndereco;

    // --- DADOS DO DESLOCAMENTO ----------------------------------------------

    @Column(name = "motivo", nullable = false, length = 255)
    private String motivo;

    @Column(name = "data_saida", nullable = false, columnDefinition = "datetime")
    private OffsetDateTime dataSaida;

    @Column(name = "data_chegada_prevista", nullable = false, columnDefinition = "datetime")
    private OffsetDateTime dataChegadaPrevista;

    @Column(name = "data_chegada_real", columnDefinition = "datetime")
    private OffsetDateTime dataChegadaReal;

    // --- ENUM TRANSPORTE ----------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "meio_transporte", nullable = false, length = 20)
    private MeioTransporte meioTransporte;

    // --- CUSTOS --------------------------------------------------------------

    @Column(name = "custo_estimado", precision = 10, scale = 2)
    private BigDecimal custoEstimado;

    @Column(name = "custo_real", precision = 10, scale = 2)
    private BigDecimal custoReal;

    // --- STATUS --------------------------------------------------------------

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusDeslocamento status = StatusDeslocamento.PLANEJADO;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    // --- AUDITORIA -----------------------------------------------------------

    @CreationTimestamp
    @Column(name = "data_cadastro", nullable = false, columnDefinition = "datetime")
    private OffsetDateTime dataCadastro;

    @UpdateTimestamp
    @Column(name = "data_alteracao", columnDefinition = "datetime")
    private OffsetDateTime dataAlteracao;

    @CreatedBy
    @Column(name = "criado_por")
    private Long criadoPor;

    @LastModifiedBy
    @Column(name = "alterado_por")
    private Long alteradoPor;
}