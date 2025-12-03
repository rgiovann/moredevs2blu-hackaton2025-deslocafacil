package edu.entra21.fiberguardian.repository;

import edu.entra21.fiberguardian.model.Deslocamento;
import edu.entra21.fiberguardian.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeslocamentoRepository extends JpaRepository<Deslocamento, Long>
{

    //Optional<Usuario> findByEmail(String email);

    //@Query("SELECT COUNT(d) > 0 FROM Deslocamento d WHERE d.id = :id")
    //boolean existsDeslocamentoById(@Param("id") Long id);
}