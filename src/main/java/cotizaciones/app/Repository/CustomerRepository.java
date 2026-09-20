package cotizaciones.app.Repository;


import cotizaciones.app.Model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByNombreContainingIgnoreCaseOrderByNombreAsc(String nombre);
}