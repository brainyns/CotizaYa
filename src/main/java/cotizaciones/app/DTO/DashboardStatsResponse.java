package cotizaciones.app.DTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardStatsResponse(
        long totalClientes,
        long totalAssets,
        long cotizacionesMes,
        long cotizacionesPorAprobar,
        BigDecimal ingresosMes,
        long ordenesAbiertas,
        long ordenesEnProceso,
        double tasaAprobacion,
        Map<String, Long> cotizacionesPorEstado,
        List<IngresoMensual> ingresosUltimosMeses,
        List<ClienteTop> topClientes
) {
    public record IngresoMensual(String mes, BigDecimal total) {}
    public record ClienteTop(Long id, String nombre, BigDecimal total, long ordenes) {}
}