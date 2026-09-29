package cotizaciones.app.Repository;

import cotizaciones.app.Model.BusinessSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessSettingsRepository extends JpaRepository<BusinessSettings, Long> {
    // No necesita métodos custom: solo hay una fila, usamos findAll().stream().findFirst()
}