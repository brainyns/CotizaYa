package cotizaciones.app.DTO;

import cotizaciones.app.Model.QuoteItem;

import java.math.BigDecimal;

public record QuoteItemResponse(
        Long id,
        String descripcion,
        BigDecimal cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal,
        Integer orden
) {
    public static QuoteItemResponse from(QuoteItem item) {
        return new QuoteItemResponse(
                item.getId(),
                item.getDescripcion(),
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.getSubtotal(),
                item.getOrden()
        );
    }
}
