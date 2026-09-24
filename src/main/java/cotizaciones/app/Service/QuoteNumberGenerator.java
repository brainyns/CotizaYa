package cotizaciones.app.Service;

import cotizaciones.app.Repository.QuoteRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;


@Component
public class QuoteNumberGenerator {

    private final QuoteRepository quoteRepo;

    public QuoteNumberGenerator(QuoteRepository quoteRepo) {
        this.quoteRepo = quoteRepo;
    }

    /**
     * Genera el siguiente número correlativo del año actual.
     * Formato: COT-YYYY-NNNN (NNNN con ceros a la izquierda).
     *
     * IMPORTANTE: se ejecuta en una transacción REQUIRES_NEW para que
     * no entre en conflicto con la transacción principal del QuoteService.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generarSiguiente() {
        int anio = Year.now().getValue();
        var ultimo = quoteRepo.findUltimoNumeroPorAnio(anio);

        int siguiente = ultimo
                .map(n -> extraerCorrelativo(n) + 1)
                .orElse(1);

        return String.format("COT-%d-%04d", anio, siguiente);
    }

    private int extraerCorrelativo(String numero) {
        // numero = "COT-2026-0042" → devuelve 42
        var partes = numero.split("-");
        if (partes.length != 3) return 0;
        try {
            return Integer.parseInt(partes[2]);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
