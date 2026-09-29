package cotizaciones.app.DTO;

import cotizaciones.app.Model.BusinessSettings;

import java.time.OffsetDateTime;

public record BusinessSettingsResponse(
        Long id,
        String nombreTaller,
        String nit,
        String telefono,
        String email,
        String direccion,
        String ciudad,
        String notasPie,
        String logoBase64,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static BusinessSettingsResponse from(BusinessSettings bs) {
        return new BusinessSettingsResponse(
                bs.getId(),
                bs.getNombreTaller(),
                bs.getNit(),
                bs.getTelefono(),
                bs.getEmail(),
                bs.getDireccion(),
                bs.getCiudad(),
                bs.getNotasPie(),
                bs.getLogoBase64(),
                bs.getCreatedAt(),
                bs.getUpdatedAt()
        );
    }
}