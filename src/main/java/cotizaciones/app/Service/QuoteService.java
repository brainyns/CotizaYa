package cotizaciones.app.Service;




import cotizaciones.app.DTO.QuoteItemRequest;
import cotizaciones.app.DTO.QuoteRequest;
import cotizaciones.app.DTO.QuoteResponse;
import cotizaciones.app.Model.Quote;
import cotizaciones.app.Model.QuoteItem;
import cotizaciones.app.Model.QuoteStatus;
import cotizaciones.app.Repository.AssetRepository;
import cotizaciones.app.Repository.CustomerRepository;
import cotizaciones.app.Repository.QuoteRepository;
import cotizaciones.app.shared.AssetNotFoundException;
import cotizaciones.app.shared.CustomerNotFoundException;
import cotizaciones.app.shared.QuoteNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class QuoteService {



    private final QuoteRepository quoteRepo;
    private final CustomerRepository customerRepo;
    private final AssetRepository assetRepo;
    private final QuoteNumberGenerator numberGenerator;

    public QuoteService(
            QuoteRepository quoteRepo,
            CustomerRepository customerRepo,
            AssetRepository assetRepo,
            QuoteNumberGenerator numberGenerator
    ) {
        this.quoteRepo = quoteRepo;
        this.customerRepo = customerRepo;
        this.assetRepo = assetRepo;
        this.numberGenerator = numberGenerator;
    }

    @Transactional(readOnly = true)
    public List<QuoteResponse> listar(Long customerId, QuoteStatus estado) {
        List<Quote> data;
        if (customerId != null) {
            data = quoteRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
        } else if (estado != null) {
            data = quoteRepo.findByEstadoOrderByCreatedAtDesc(estado);
        } else {
            data = quoteRepo.findAll();
        }
        return data.stream().map(QuoteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public QuoteResponse obtener(Long id) {
        return quoteRepo.findById(id)
                .map(QuoteResponse::from)
                .orElseThrow(() -> new QuoteNotFoundException(id));
    }

    public QuoteResponse crear(QuoteRequest req) {
        var customer = customerRepo.findById(req.customerId())
                .orElseThrow(() -> new CustomerNotFoundException(req.customerId()));

        var quote = new Quote();
        quote.setNumero(numberGenerator.generarSiguiente());
        quote.setCustomer(customer);
        quote.setNotas(req.notas());
        quote.setEstado(QuoteStatus.BORRADOR);

        if (req.assetId() != null) {
            var asset = assetRepo.findById(req.assetId())
                    .orElseThrow(() -> new AssetNotFoundException(req.assetId()));
            // Validar que el asset pertenece al cliente
            if (!asset.getCustomer().getId().equals(customer.getId())) {
                throw new IllegalArgumentException(
                        "El asset " + req.assetId() + " no pertenece al cliente " + customer.getId()
                );
            }
            quote.setAsset(asset);
        }

        aplicarItems(quote, req.items());
        quote.recalcularTotal();

        return QuoteResponse.from(quoteRepo.save(quote));
    }

    public QuoteResponse actualizar(Long id, QuoteRequest req) {
        var quote = quoteRepo.findById(id)
                .orElseThrow(() -> new QuoteNotFoundException(id));

        // Regla de negocio: solo se puede editar si está en BORRADOR
        if (quote.getEstado() != QuoteStatus.BORRADOR) {
            throw new IllegalStateException(
                    "Solo se pueden editar cotizaciones en estado BORRADOR. Estado actual: " + quote.getEstado()
            );
        }

        // Cambio de cliente
        if (!quote.getCustomer().getId().equals(req.customerId())) {
            var customer = customerRepo.findById(req.customerId())
                    .orElseThrow(() -> new CustomerNotFoundException(req.customerId()));
            quote.setCustomer(customer);
        }

        // Cambio de asset (puede ser null → quitar asset)
        if (req.assetId() == null) {
            quote.setAsset(null);
        } else {
            var asset = assetRepo.findById(req.assetId())
                    .orElseThrow(() -> new AssetNotFoundException(req.assetId()));
            if (!asset.getCustomer().getId().equals(req.customerId())) {
                throw new IllegalArgumentException(
                        "El asset " + req.assetId() + " no pertenece al cliente " + req.customerId()
                );
            }
            quote.setAsset(asset);
        }

        quote.setNotas(req.notas());
        aplicarItems(quote, req.items());
        quote.recalcularTotal();

        return QuoteResponse.from(quoteRepo.save(quote));
    }

    public QuoteResponse cambiarEstado(Long id, QuoteStatus nuevoEstado) {
        var quote = quoteRepo.findById(id)
                .orElseThrow(() -> new QuoteNotFoundException(id));

        // Reglas de transición de estados
        var estadoActual = quote.getEstado();
        boolean transicionValida = switch (estadoActual) {
            case BORRADOR -> nuevoEstado == QuoteStatus.ENVIADA;
            case ENVIADA -> nuevoEstado == QuoteStatus.APROBADA
                    || nuevoEstado == QuoteStatus.RECHAZADA;
            case APROBADA, RECHAZADA -> false; // estados finales
        };

        if (!transicionValida) {
            throw new IllegalStateException(
                    "Transición no permitida: " + estadoActual + " → " + nuevoEstado
            );
        }

        quote.setEstado(nuevoEstado);
        return QuoteResponse.from(quoteRepo.save(quote));
    }

    public void eliminar(Long id) {
        var quote = quoteRepo.findById(id)
                .orElseThrow(() -> new QuoteNotFoundException(id));

        // Regla: no se puede eliminar si ya fue enviada
        if (quote.getEstado() != QuoteStatus.BORRADOR) {
            throw new IllegalStateException(
                    "Solo se pueden eliminar cotizaciones en estado BORRADOR"
            );
        }

        quoteRepo.delete(quote);
    }

    // --- Helpers privados ---

    /**
     * Reemplaza todos los ítems de la cotización.
     * Gracias a orphanRemoval=true, los viejos se borran automáticamente.
     */
    private void aplicarItems(Quote quote, List<QuoteItemRequest> items) {
        var nuevos = new java.util.ArrayList<QuoteItem>();
        int orden = 0;
        for (var req : items) {
            var item = new QuoteItem();
            item.setDescripcion(req.descripcion());
            item.setCantidad(req.cantidad());
            item.setPrecioUnitario(req.precioUnitario());
            item.setOrden(orden++);
            item.recalcularSubtotal();
            nuevos.add(item);
        }
        quote.replaceItems(nuevos);
    }
}
