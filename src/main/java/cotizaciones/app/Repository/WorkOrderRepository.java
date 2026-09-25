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