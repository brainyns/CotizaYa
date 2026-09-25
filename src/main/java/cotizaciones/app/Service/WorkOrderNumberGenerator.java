package cotizaciones.app.Service;


import cotizaciones.app.Repository.WorkOrderRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

@Component
public class WorkOrderNumberGenerator {

    private final WorkOrderRepository workOrderRepo;

    public WorkOrderNumberGenerator(WorkOrderRepository workOrderRepo) {
        this.workOrderRepo = workOrderRepo;
    }

    /**
     * Genera el siguiente número correlativo del año actual.
     * Formato: OT-YYYY-NNNN
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generarSiguiente() {
        int anio = Year.now().getValue();
        var ultimo = workOrderRepo.findUltimoNumeroPorAnio(anio);

        int siguiente = ultimo
                .map(this::extraerCorrelativo)
                .map(n -> n + 1)
                .orElse(1);

        return String.format("OT-%d-%04d", anio, siguiente);
    }

    private int extraerCorrelativo(String numero) {
        var partes = numero.split("-");
        if (partes.length != 3) return 0;
        try {
            return Integer.parseInt(partes[2]);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}