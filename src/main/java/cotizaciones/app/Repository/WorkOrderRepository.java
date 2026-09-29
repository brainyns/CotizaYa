package cotizaciones.app.Repository;


import cotizaciones.app.Model.WorkOrder;
import cotizaciones.app.Model.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    List<WorkOrder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<WorkOrder> findByEstadoOrderByCreatedAtDesc(WorkOrderStatus estado);

    Optional<WorkOrder> findByNumero(String numero);

    List<WorkOrder> findByQuoteId(Long quoteId);

    long countByEstado(WorkOrderStatus estado);

@org.springframework.data.jpa.repository.Query("""
        SELECT COALESCE(SUM(wo.total), 0)
        FROM WorkOrder wo
        WHERE wo.estado = :estado
          AND wo.fechaEntrega >= :desde
          AND wo.fechaEntrega < :hasta
        """)
java.math.BigDecimal sumTotalByEstadoAndFechaEntregaBetween(
        @org.springframework.data.repository.query.Param("estado") WorkOrderStatus estado,
        @org.springframework.data.repository.query.Param("desde") java.time.OffsetDateTime desde,
        @org.springframework.data.repository.query.Param("hasta") java.time.OffsetDateTime hasta
);

@org.springframework.data.jpa.repository.Query("""
        SELECT FUNCTION('TO_CHAR', wo.fechaEntrega, 'YYYY-MM') as mes,
               COALESCE(SUM(wo.total), 0) as total
        FROM WorkOrder wo
        WHERE wo.estado = :estado
          AND wo.fechaEntrega >= :desde
        GROUP BY FUNCTION('TO_CHAR', wo.fechaEntrega, 'YYYY-MM')
        ORDER BY mes ASC
        """)
java.util.List<Object[]> sumTotalPorMes(
        @org.springframework.data.repository.query.Param("estado") WorkOrderStatus estado,
        @org.springframework.data.repository.query.Param("desde") java.time.OffsetDateTime desde
);

@org.springframework.data.jpa.repository.Query("""
        SELECT wo.customer.id, wo.customer.nombre, SUM(wo.total), COUNT(wo)
        FROM WorkOrder wo
        WHERE wo.estado = :estado
        GROUP BY wo.customer.id, wo.customer.nombre
        ORDER BY SUM(wo.total) DESC
        """)
java.util.List<Object[]> topClientesPorFacturacion(
        @org.springframework.data.repository.query.Param("estado") WorkOrderStatus estado,
        org.springframework.data.domain.Pageable pageable
);

    /**
     * Devuelve el número más alto de OT para un año dado.
     */
    @Query("""
            SELECT wo.numero FROM WorkOrder wo
            WHERE wo.numero LIKE CONCAT('OT-', :anio, '-%')
            ORDER BY wo.numero DESC
            LIMIT 1
            """)
    Optional<String> findUltimoNumeroPorAnio(@Param("anio") int anio);
}