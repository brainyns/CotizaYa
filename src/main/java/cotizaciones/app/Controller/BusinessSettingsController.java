package cotizaciones.app.Controller;

import cotizaciones.app.DTO.BusinessSettingsRequest;
import cotizaciones.app.DTO.BusinessSettingsResponse;
import cotizaciones.app.Service.BusinessSettingsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business-settings")
public class BusinessSettingsController {

    private final BusinessSettingsService service;

    public BusinessSettingsController(BusinessSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public BusinessSettingsResponse obtener() {
        return service.obtener();
    }

    @PutMapping
    public BusinessSettingsResponse actualizar(@Valid @RequestBody BusinessSettingsRequest req) {
        return service.actualizar(req);
    }
}