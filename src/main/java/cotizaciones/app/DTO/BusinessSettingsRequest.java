package cotizaciones.app.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BusinessSettingsRequest(
        @NotBlank @Size(max = 120) String nombreTaller,
        @Size(max = 30) String nit,
        @Size(max = 30) String telefono,
        @Size(max = 120) String email,
        @Size(max = 200) String direccion,
        @Size(max = 80) String ciudad,
        String notasPie,
        String logoBase64
) {}