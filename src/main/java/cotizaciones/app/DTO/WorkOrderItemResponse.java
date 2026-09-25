package cotizaciones.app.DTO;


import cotizaciones.app.Model.WorkOrderItem;

import java.math.BigDecimal;

public record WorkOrderItemResponse(
        Long id,
        String descripcion,
        BigDecimal cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal,
        Integer orden
) {
    public static WorkOrderItemResponse from(WorkOrderItem item) {
        return new WorkOrderItemResponse(
                item.getId(),
                item.getDescripcion(),
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.getSubtotal(),
                item.getOrden()
        );
    }
}