package edu.entra21.fiberguardian.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@Table(name = "checkpoint")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class CheckPoint {

    @Id
    @EqualsAndHashCode.Include
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- RELACIONAMENTO ------------------------------------------------------

    @ManyToOne(optional = false)
    @JoinColumn(name = "deslocamento_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_checkpoint_deslocamento"))
    private Deslocamento deslocamento;

    // --- DADOS DO CHECKPOINT -------------------------------------------------

    @Column(name = "descricao", length = 255)
    private String descricao;

    @Column(name = "ordem_sugerida")
    private Integer ordemSugerida;

    @Column(name = "icone", length = 50)
    private String icone;

    @Column(name = "cor", length = 7)
    private String cor;

    @Column(name = "localizacao", length = 255)
    private String localizacao;

    @Column(name = "data_prevista", columnDefinition = "datetime")
    private OffsetDateTime dataPrevista;

    @Column(name = "data_realizada", columnDefinition = "datetime")
    private OffsetDateTime dataRealizada;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false, length = 20)
    private CategoriaCheckpoint categoria;

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
