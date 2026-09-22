package cotizaciones.app.Repository;



import cotizaciones.app.Model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByCustomerIdOrderByIdDesc(Long customerId);
    boolean existsByIdAndCustomerId(Long id, Long customerId);
}
