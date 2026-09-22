package cotizaciones.app.Controller;


import cotizaciones.app.DTO.AssetRequest;
import cotizaciones.app.DTO.AssetResponse;
import cotizaciones.app.Service.AssetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AssetController {
    
    private final AssetService service;

    public AssetController(AssetService service) {
        this.service = service;
    }

    // --- Endpoints anidados al cliente ---

    @GetMapping("/customers/{customerId}/assets")
    public List<AssetResponse> listarPorCliente(@PathVariable Long customerId) {
        return service.listarPorCliente(customerId);
    }

    @PostMapping("/customers/{customerId}/assets")
    public ResponseEntity<AssetResponse> crear(
            @PathVariable Long customerId,
            @Valid @RequestBody AssetRequest req
    ) {
        var created = service.crear(customerId, req);
        return ResponseEntity
                .created(URI.create("/api/assets/" + created.id()))
                .body(created);
    }

    // --- Endpoints directos al asset ---

    @GetMapping("/assets/{id}")
    public AssetResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PutMapping("/assets/{id}")
    public AssetResponse actualizar(
            @PathVariable Long id,
            @Valid @RequestBody AssetRequest req
    ) {
        return service.actualizar(id, req);
    }

    @DeleteMapping("/assets/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

}
