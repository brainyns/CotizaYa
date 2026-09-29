package cotizaciones.app.Service;

import cotizaciones.app.DTO.BusinessSettingsRequest;
import cotizaciones.app.DTO.BusinessSettingsResponse;
import cotizaciones.app.Model.BusinessSettings;
import cotizaciones.app.Repository.BusinessSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BusinessSettingsService {

    private final BusinessSettingsRepository repo;

    public BusinessSettingsService(BusinessSettingsRepository repo) {
        this.repo = repo;
    }

    /**
     * Devuelve la configuración del taller.
     * Como es singleton, siempre existe la fila insertada por la migración V5.
     */
    @Transactional(readOnly = true)
    public BusinessSettingsResponse obtener() {
        var settings = repo.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No hay configuración del taller. Ejecuta la migración V5."
                ));
        return BusinessSettingsResponse.from(settings);
    }

    public BusinessSettingsResponse actualizar(BusinessSettingsRequest req) {
        var settings = repo.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No hay configuración del taller. Ejecuta la migración V5."
                ));

        settings.setNombreTaller(req.nombreTaller());
        settings.setNit(req.nit());
        settings.setTelefono(req.telefono());
        settings.setEmail(req.email());
        settings.setDireccion(req.direccion());
        settings.setCiudad(req.ciudad());
        settings.setNotasPie(req.notasPie());
        settings.setLogoBase64(req.logoBase64());

        return BusinessSettingsResponse.from(repo.save(settings));
    }
}