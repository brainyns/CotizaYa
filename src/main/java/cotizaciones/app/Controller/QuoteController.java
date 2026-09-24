package cotizaciones.app.Controller;

import cotizaciones.app.DTO.QuoteRequest;
import cotizaciones.app.DTO.QuoteResponse;
import cotizaciones.app.Model.QuoteStatus;
import cotizaciones.app.Service.QuoteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    
    private final QuoteService service;

    public QuoteController(QuoteService service) {
        this.service = service;
    }

    @GetMapping
    public List<QuoteResponse> listar(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) QuoteStatus estado
    ) {
        return service.listar(customerId, estado);
    }

    @GetMapping("/{id}")
    public QuoteResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<QuoteResponse> crear(@Valid @RequestBody QuoteRequest req) {
        var created = service.crear(req);
        return ResponseEntity
                .created(URI.create("/api/quotes/" + created.id()))
                .body(created);
    }

    @PutMapping("/{id}")
    public QuoteResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody QuoteRequest req
    ) {
        return service.actualizar(id, req);
    }

    @PatchMapping("/{id}/estado")
    public QuoteResponse cambiarEstado(
            @PathVariable Long id,
            @RequestParam QuoteStatus estado
    ) {
        return service.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
