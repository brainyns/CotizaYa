package cotizaciones.app.DTO;


import cotizaciones.app.Model.Customer;

import java.time.OffsetDateTime;
public record CustomerResponse(
        Long id,
        String nombre,
        String telefono,
        String email,
        String notas,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static CustomerResponse from(Customer c) {
        return new CustomerResponse(
                c.getId(), c.getNombre(), c.getTelefono(),
                c.getEmail(), c.getNotas(),
                c.getCreatedAt(), c.getUpdatedAt()
        );
    }

}
