package edu.entra21.fiberguardian.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.entra21.fiberguardian.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	Optional<Usuario> findByEmail(String email);

	@Query(value = """
    SELECT *
    FROM usuario u
    WHERE LOWER(u.nome) LIKE LOWER(CONCAT('%', :nomeParcial, '%'))
      AND u.role IN (:roles)
      AND u.ativo = 1
      ORDER BY u.nome ASC
    LIMIT 20
""", nativeQuery = true)
	List<Usuario> findTop20UsuarioRecebimentoByNomeContainingIgnoreCase(
			@Param("nomeParcial") String nomeParcial,
			@Param("roles")   List<String> role
	);

	@Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.email = :email")
	boolean existsUsuarioByEmail(@Param("email") String email);
}
