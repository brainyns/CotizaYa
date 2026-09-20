package cotizaciones.app.shared;

public class CustomerNotFoundException extends RuntimeException {
    public CustomerNotFoundException(Long id) {
        super("Cliente no encontrado: " + id);
    }
}