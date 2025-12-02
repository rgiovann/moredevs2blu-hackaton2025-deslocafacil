package edu.entra21.fiberguardian.model;

import java.time.OffsetDateTime;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@Table(name = "usuario")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)

public class Usuario {

	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "nome", nullable = false, length = 100)
	private String nome;

	@Column(name = "email", nullable = false, length = 100)
	private String email;

	@Column(name = "senha", nullable = false, length = 100)
	@ToString.Exclude
	private String senha;

	@Column(name = "telefone", length = 15)
	private String telefone;

	@Column(name = "ativo", nullable = false)
	private Boolean ativo = true;

	@Enumerated(EnumType.STRING)
	@Column(name = "role", nullable = false, length = 20)
	private Role role = Role.USUARIO;

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