package cotizaciones.app.DTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record QuoteItemRequest(
        @NotBlank @Size(max = 255) String descripcion,
        @NotNull @DecimalMin(value = "0.01") BigDecimal cantidad,
        @NotNull @DecimalMin(value = "0.00") BigDecimal precioUnitario
){}