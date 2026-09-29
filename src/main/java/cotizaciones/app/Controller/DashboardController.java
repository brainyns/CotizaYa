package cotizaciones.app.Controller;

import cotizaciones.app.DTO.DashboardStatsResponse;
import cotizaciones.app.Service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/stats")
    public DashboardStatsResponse stats() {
        return service.stats();
    }
}