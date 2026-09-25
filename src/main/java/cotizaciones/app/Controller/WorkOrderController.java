package cotizaciones.app.Controller;

import cotizaciones.app.DTO.WorkOrderRequest;
import cotizaciones.app.DTO.WorkOrderResponse;
import cotizaciones.app.Model.WorkOrderStatus;
import cotizaciones.app.Service.WorkOrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService service;

    public WorkOrderController(WorkOrderService service) {
        this.service = service;
    }

    @GetMapping
    public List<WorkOrderResponse> listar(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) WorkOrderStatus estado
    ) {
        return service.listar(customerId, estado);
    }

    @GetMapping("/{id}")
    public WorkOrderResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<WorkOrderResponse> crear(@Valid @RequestBody WorkOrderRequest req) {
        var created = service.crear(req);
        return ResponseEntity
                .created(URI.create("/api/work-orders/" + created.id()))
                .body(created);
    }

    @PutMapping("/{id}")
    public WorkOrderResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderRequest req
    ) {
        return service.actualizar(id, req);
    }

    @PatchMapping("/{id}/estado")
    public WorkOrderResponse cambiarEstado(
            @PathVariable Long id,
            @RequestParam WorkOrderStatus estado
    ) {
        return service.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}