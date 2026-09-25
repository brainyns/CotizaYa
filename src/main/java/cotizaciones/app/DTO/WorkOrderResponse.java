package cotizaciones.app.DTO;

import cotizaciones.app.Model.WorkOrder;
import cotizaciones.app.Model.WorkOrderStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record WorkOrderResponse(
        Long id,
        String numero,
        Long quoteId,
        String quoteNumero,
        Long customerId,
        String customerNombre,
        Long assetId,
        String assetDescripcion,
        WorkOrderStatus estado,
        String notas,
        BigDecimal total,
        OffsetDateTime fechaApertura,
        OffsetDateTime fechaCierre,
        OffsetDateTime fechaEntrega,
        List<WorkOrderItemResponse> items,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static WorkOrderResponse from(WorkOrder wo) {
        return new WorkOrderResponse(
                wo.getId(),
                wo.getNumero(),
                wo.getQuote() != null ? wo.getQuote().getId() : null,
                wo.getQuote() != null ? wo.getQuote().getNumero() : null,
                wo.getCustomer().getId(),
                wo.getCustomer().getNombre(),
                wo.getAsset() != null ? wo.getAsset().getId() : null,
                wo.getAsset() != null ? descripcionAsset(wo) : null,
                wo.getEstado(),
                wo.getNotas(),
                wo.getTotal(),
                wo.getFechaApertura(),
                wo.getFechaCierre(),
                wo.getFechaEntrega(),
                wo.getItems().stream().map(WorkOrderItemResponse::from).toList(),
                wo.getCreatedAt(),
                wo.getUpdatedAt()
        );
    }

    private static String descripcionAsset(WorkOrder wo) {
        var a = wo.getAsset();
        var partes = new java.util.ArrayList<String>();
        if (a.getMarca() != null) partes.add(a.getMarca());
        if (a.getModelo() != null) partes.add(a.getModelo());
        if (a.getPlacaSerial() != null) partes.add("(" + a.getPlacaSerial() + ")");
        return partes.isEmpty() ? "Asset #" + a.getId() : String.join(" ", partes);
    }
}