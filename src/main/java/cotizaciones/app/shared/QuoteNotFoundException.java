package cotizaciones.app.shared;

public class QuoteNotFoundException extends RuntimeException {
    public QuoteNotFoundException(Long id) {
        super("Cotización no encontrada: " + id);
    }
}