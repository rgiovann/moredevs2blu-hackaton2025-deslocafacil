package edu.entra21.fiberguardian.repository;

import edu.entra21.fiberguardian.model.CheckPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CheckpointRepository extends JpaRepository<CheckPoint, Long> {

}
