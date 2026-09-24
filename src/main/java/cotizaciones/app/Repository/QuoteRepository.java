package cotizaciones.app.Repository;

import cotizaciones.app.Model.Quote;
import cotizaciones.app.Model.QuoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuoteRepository extends JpaRepository<Quote, Long> {

    List<Quote> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Quote> findByEstadoOrderByCreatedAtDesc(QuoteStatus estado);

    Optional<Quote> findByNumero(String numero);

    /**
     * Devuelve el número más alto de cotización para un año dado.
     * Retorna null si no hay ninguna.
     * Ejemplo: si el más alto es "COT-2026-0042", devuelve "COT-2026-0042".
     */
    @Query("""
            SELECT q.numero FROM Quote q
            WHERE q.numero LIKE CONCAT('COT-', :anio, '-%')
            ORDER BY q.numero DESC
            LIMIT 1
            """)
    Optional<String> findUltimoNumeroPorAnio(@Param("anio") int anio);
}