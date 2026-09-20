package cotizaciones.app.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank @Size(max = 120) String nombre,
        @Size(max = 30) String telefono,
        @Email @Size(max = 120) String email,
        String notas
        ) {}