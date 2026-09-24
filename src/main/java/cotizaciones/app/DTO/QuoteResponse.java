package cotizaciones.app.DTO;


import cotizaciones.app.Model.Quote;
import cotizaciones.app.Model.QuoteStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record QuoteResponse(
        Long id,
        String numero,
        Long customerId,
        String customerNombre,
        Long assetId,
        String assetDescripcion,
        QuoteStatus estado,
        String notas,
        BigDecimal total,
        List<QuoteItemResponse> items,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static QuoteResponse from(Quote q) {
        return new QuoteResponse(
                q.getId(),
                q.getNumero(),
                q.getCustomer().getId(),
                q.getCustomer().getNombre(),
                q.getAsset() != null ? q.getAsset().getId() : null,
                q.getAsset() != null ? descripcionAsset(q) : null,
                q.getEstado(),
                q.getNotas(),
                q.getTotal(),
                q.getItems().stream().map(QuoteItemResponse::from).toList(),
                q.getCreatedAt(),
                q.getUpdatedAt()
        );
    }

    private static String descripcionAsset(Quote q) {
        var a = q.getAsset();
        var partes = new java.util.ArrayList<String>();
        if (a.getMarca() != null) partes.add(a.getMarca());
        if (a.getModelo() != null) partes.add(a.getModelo());
        if (a.getPlacaSerial() != null) partes.add("(" + a.getPlacaSerial() + ")");
        return partes.isEmpty() ? "Asset #" + a.getId() : String.join(" ", partes);
    }
}