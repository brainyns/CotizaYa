package cotizaciones.app.shared;

public class WorkOrderNotFoundException extends RuntimeException {
    public WorkOrderNotFoundException(Long id) {
        super("Orden de trabajo no encontrada: " + id);
    }
}