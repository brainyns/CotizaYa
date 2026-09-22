package cotizaciones.app.DTO;

import cotizaciones.app.Model.Asset;
import cotizaciones.app.Model.AssetType;

import java.time.OffsetDateTime;

public record  AssetResponse (

    Long id,
        Long customerId,
        AssetType tipo,
        String marca,
        String modelo,
        String placaSerial,
        Integer anio,
        String notas,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt

){
     public static AssetResponse from(Asset a) {
        return new AssetResponse(
                a.getId(),
                a.getCustomer().getId(),
                a.getTipo(),
                a.getMarca(),
                a.getModelo(),
                a.getPlacaSerial(),
                a.getAnio(),
                a.getNotas(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}