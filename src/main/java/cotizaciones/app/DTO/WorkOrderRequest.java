package cotizaciones.app.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record WorkOrderRequest(
        @NotNull Long customerId,
        Long assetId,
        Long quoteId,
        @Size(max = 2000) String notas,
        @NotEmpty @Valid List<WorkOrderItemRequest> items
) {}
