package edu.entra21.fiberguardian.service.query;

import edu.entra21.fiberguardian.model.Deslocamento;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class DeslocamentoQueryServiceImpl implements DeslocamentoQueryService {

    @PersistenceContext
    private EntityManager manager;

    @Override
    public Page<Deslocamento> consultarDeslocamentos(DeslocamentoFilter filtro, Pageable pageable) {
        var builder = manager.getCriteriaBuilder();
        var query = builder.createQuery(Deslocamento.class);
        var root = query.from(Deslocamento.class);
        // para carregar as entidades (está lazy na entidade Deslocamento)
        root.fetch("usuario", JoinType.LEFT);
 
        var predicates = construirPredicados(builder, root, filtro);

        query.select(root).distinct(true);
        query.where(predicates.toArray(new Predicate[0]));

        // Aplica ordenação do Pageable
        if (pageable.getSort().isSorted()) {
            var orders = new ArrayList<Order>();
            pageable.getSort().forEach(sortOrder -> {
                if (sortOrder.isAscending()) {
                    orders.add(builder.asc(root.get(sortOrder.getProperty())));
                } else {
                    orders.add(builder.desc(root.get(sortOrder.getProperty())));
                }
            });
            query.orderBy(orders);
        }

        // Executa query principal com paginação
        TypedQuery<Deslocamento> typedQuery = manager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Deslocamento> content = typedQuery.getResultList();

        // Query para contar total de elementos
        Long total = contarTotalElementos(builder, filtro);

        return new PageImpl<>(content, pageable, total);
    }

    private List<Predicate> construirPredicados(CriteriaBuilder builder, Root<Deslocamento> root, DeslocamentoFilter filtro) {
        var predicates = new ArrayList<Predicate>();


        // Filtro por intervalo de datas
        if (filtro.getDataSaidaDeslocamentoInicio() != null) {
            predicates.add(builder.greaterThanOrEqualTo(root.get("dataSaida"), filtro.getDataSaidaDeslocamentoInicio()));
        }
        if (filtro.getDataSaidaDeslocamentoFim() != null) {
            predicates.add(builder.lessThanOrEqualTo(root.get("dataSaida"), filtro.getDataSaidaDeslocamentoFim()));
        }

        // Filtro por status
        if (filtro.getStatus() != null
                && !filtro.getStatus().isBlank()
                && !"TODOS".equalsIgnoreCase(filtro.getStatus())) {

            predicates.add(builder.like(root.get("status"), "%" + filtro.getStatus() + "%"));
        }

        // Filtro por usuario (email)
        if (filtro.getEmailUsuario() != null && !filtro.getEmailUsuario().isBlank()) {
            predicates.add(builder.equal(root.get("usuario").get("email"), filtro.getEmailUsuario()));
        }

        return predicates;
    }

    private Long contarTotalElementos(CriteriaBuilder builder, DeslocamentoFilter filtro) {
        var countQuery = builder.createQuery(Long.class);
        var countRoot = countQuery.from(Deslocamento.class);

        var predicates = construirPredicados(builder, countRoot, filtro);

        // Para count com DISTINCT, precisa contar as Deslocamento distintas
        countQuery.select(builder.countDistinct(countRoot));
        countQuery.where(predicates.toArray(new Predicate[0]));

        return manager.createQuery(countQuery).getSingleResult();
    }
}
