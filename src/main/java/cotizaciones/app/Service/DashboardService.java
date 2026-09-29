package cotizaciones.app.Service;

import cotizaciones.app.DTO.DashboardStatsResponse;
import cotizaciones.app.Model.QuoteStatus;
import cotizaciones.app.Model.WorkOrderStatus;
import cotizaciones.app.Repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final CustomerRepository customerRepo;
    private final AssetRepository assetRepo;
    private final QuoteRepository quoteRepo;
    private final WorkOrderRepository woRepo;

    public DashboardService(
            CustomerRepository customerRepo,
            AssetRepository assetRepo,
            QuoteRepository quoteRepo,
            WorkOrderRepository woRepo
    ) {
        this.customerRepo = customerRepo;
        this.assetRepo = assetRepo;
        this.quoteRepo = quoteRepo;
        this.woRepo = woRepo;
    }

    public DashboardStatsResponse stats() {
        var ahora = OffsetDateTime.now();
        var inicioMes = YearMonth.from(ahora).atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        var inicioMesSiguiente = YearMonth.from(ahora).plusMonths(1).atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);

        // Contadores básicos
        var totalClientes = customerRepo.count();
        var totalAssets = assetRepo.count();

        // Cotizaciones
        var cotizacionesMes = quoteRepo.countByCreatedAtBetween(inicioMes, inicioMesSiguiente);
        var cotizacionesPorAprobar = quoteRepo.countByEstado(QuoteStatus.ENVIADA);
        var aprobadas = quoteRepo.countByEstado(QuoteStatus.APROBADA);
        var enviadas = quoteRepo.countByEstado(QuoteStatus.ENVIADA);
        var rechazadas = quoteRepo.countByEstado(QuoteStatus.RECHAZADA);

        var totalRespondidas = aprobadas + rechazadas;
        var tasaAprobacion = totalRespondidas > 0
                ? (aprobadas * 100.0) / totalRespondidas
                : 0.0;

        // Órdenes
        var ordenesAbiertas = woRepo.countByEstado(WorkOrderStatus.ABIERTA);
        var ordenesEnProceso = woRepo.countByEstado(WorkOrderStatus.EN_PROCESO);

        // Ingresos del mes (OTs entregadas)
        var ingresosMes = woRepo.sumTotalByEstadoAndFechaEntregaBetween(
                WorkOrderStatus.ENTREGADA, inicioMes, inicioMesSiguiente
        );
        if (ingresosMes == null) ingresosMes = BigDecimal.ZERO;

        // Cotizaciones por estado (para el donut)
        var cotizacionesPorEstado = new LinkedHashMap<String, Long>();
        for (var fila : quoteRepo.countGroupByEstado()) {
            var estado = ((QuoteStatus) fila[0]).name();
            var count = (Long) fila[1];
            cotizacionesPorEstado.put(estado, count);
        }
        // Rellenar los que no tengan datos con 0
        for (var est : QuoteStatus.values()) {
            cotizacionesPorEstado.putIfAbsent(est.name(), 0L);
        }

        // Ingresos últimos 6 meses (para el gráfico de línea)
        var desde6meses = YearMonth.from(ahora).minusMonths(5).atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
        var ingresosPorMesMap = new LinkedHashMap<String, BigDecimal>();
        for (var fila : woRepo.sumTotalPorMes(WorkOrderStatus.ENTREGADA, desde6meses)) {
            var mes = (String) fila[0];
            var total = (BigDecimal) fila[1];
            ingresosPorMesMap.put(mes, total);
        }
        // Rellenar meses faltantes con 0
        var ingresosUltimosMeses = new java.util.ArrayList<DashboardStatsResponse.IngresoMensual>();
        for (int i = 5; i >= 0; i--) {
            var mes = YearMonth.from(ahora).minusMonths(i).toString();
            var total = ingresosPorMesMap.getOrDefault(mes, BigDecimal.ZERO);
            ingresosUltimosMeses.add(new DashboardStatsResponse.IngresoMensual(mes, total));
        }

        // Top 5 clientes por facturación (OTs entregadas)
        var topClientes = woRepo.topClientesPorFacturacion(
                WorkOrderStatus.ENTREGADA,
                PageRequest.of(0, 5)
        ).stream().map(fila -> new DashboardStatsResponse.ClienteTop(
                (Long) fila[0],
                (String) fila[1],
                ((BigDecimal) fila[2]).setScale(2, RoundingMode.HALF_UP),
                (Long) fila[3]
        )).toList();

        return new DashboardStatsResponse(
                totalClientes,
                totalAssets,
                cotizacionesMes,
                cotizacionesPorAprobar,
                ingresosMes.setScale(2, RoundingMode.HALF_UP),
                ordenesAbiertas,
                ordenesEnProceso,
                Math.round(tasaAprobacion * 10.0) / 10.0,
                cotizacionesPorEstado,
                ingresosUltimosMeses,
                topClientes
        );
    }
}