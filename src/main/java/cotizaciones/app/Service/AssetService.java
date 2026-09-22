package cotizaciones.app.Service;

import cotizaciones.app.DTO.AssetRequest;
import cotizaciones.app.DTO.AssetResponse;
import cotizaciones.app.Model.Asset;
import cotizaciones.app.Repository.AssetRepository;
import cotizaciones.app.Repository.CustomerRepository;
import cotizaciones.app.shared.AssetNotFoundException;
import cotizaciones.app.shared.CustomerNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional 
public class AssetService {
    private final AssetRepository assetRepo;
    private final CustomerRepository customerRepo;

    public AssetService(AssetRepository assetRepo, CustomerRepository customerRepo) {
        this.assetRepo = assetRepo;
        this.customerRepo = customerRepo;
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> listarPorCliente(Long customerId) {
        if (!customerRepo.existsById(customerId)) {
            throw new CustomerNotFoundException(customerId);
        }
        return assetRepo.findByCustomerIdOrderByIdDesc(customerId)
                .stream()
                .map(AssetResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AssetResponse obtener(Long id) {
        return assetRepo.findById(id)
                .map(AssetResponse::from)
                .orElseThrow(() -> new AssetNotFoundException(id));
    }

    public AssetResponse crear(Long customerId, AssetRequest req) {
        var customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));

        var asset = new Asset();
        asset.setCustomer(customer);
        aplicarCambios(asset, req);
        return AssetResponse.from(assetRepo.save(asset));
    }

    public AssetResponse actualizar(Long id, AssetRequest req) {
        var asset = assetRepo.findById(id)
                .orElseThrow(() -> new AssetNotFoundException(id));
        aplicarCambios(asset, req);
        return AssetResponse.from(assetRepo.save(asset));
    }

    public void eliminar(Long id) {
        if (!assetRepo.existsById(id)) {
            throw new AssetNotFoundException(id);
        }
        assetRepo.deleteById(id);
    }

    private void aplicarCambios(Asset asset, AssetRequest req) {
        asset.setTipo(req.tipo());
        asset.setMarca(req.marca());
        asset.setModelo(req.modelo());
        asset.setPlacaSerial(req.placaSerial());
        asset.setAnio(req.anio());
        asset.setNotas(req.notas());
    }

}
