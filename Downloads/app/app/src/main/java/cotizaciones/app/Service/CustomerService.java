package cotizaciones.app.Service;


import cotizaciones.app.DTO.CustomerRequest;
import cotizaciones.app.DTO.CustomerResponse;
import cotizaciones.app.Model.Customer;
import cotizaciones.app.Repository.CustomerRepository;
import cotizaciones.app.shared.CustomerNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository repo;

    public CustomerService(CustomerRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> listar(String q) {
        var data = (q == null || q.isBlank())
                ? repo.findAll()
                : repo.findByNombreContainingIgnoreCaseOrderByNombreAsc(q);
        return data.stream().map(CustomerResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse obtener(Long id) {
        return repo.findById(id).map(CustomerResponse::from)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }

    public CustomerResponse crear(CustomerRequest req) {
        var c = new Customer();
        c.setNombre(req.nombre());
        c.setTelefono(req.telefono());
        c.setEmail(req.email());
        c.setNotas(req.notas());
        return CustomerResponse.from(repo.save(c));
    }

    public CustomerResponse actualizar(Long id, CustomerRequest req) {
        var c = repo.findById(id).orElseThrow(() -> new CustomerNotFoundException(id));
        c.setNombre(req.nombre());
        c.setTelefono(req.telefono());
        c.setEmail(req.email());
        c.setNotas(req.notas());
        return CustomerResponse.from(repo.save(c));
    }

    public void eliminar(Long id) {
        if (!repo.existsById(id)) throw new CustomerNotFoundException(id);
        repo.deleteById(id);
    }
}