package cotizaciones.app.DTO;

import cotizaciones.app.Model.AssetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record  AssetRequest (

    @NotNull AssetType tipo,
        @Size(max = 60) String marca,
        @Size(max = 60) String modelo,
        @Size(max = 60) String placaSerial,
        Integer anio,
        String notas

){}

