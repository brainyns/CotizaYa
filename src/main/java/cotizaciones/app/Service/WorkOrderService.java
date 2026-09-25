package cotizaciones.app.Service;

import cotizaciones.app.DTO.WorkOrderItemRequest;
import cotizaciones.app.DTO.WorkOrderRequest;
import cotizaciones.app.DTO.WorkOrderResponse;
import cotizaciones.app.Model.*;
import cotizaciones.app.Repository.AssetRepository;
import cotizaciones.app.Repository.CustomerRepository;
import cotizaciones.app.Repository.QuoteRepository;
import cotizaciones.app.Repository.WorkOrderRepository;
import cotizaciones.app.shared.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class WorkOrderService {

    private final WorkOrderRepository woRepo;
    private final CustomerRepository customerRepo;
    private final AssetRepository assetRepo;
    private final QuoteRepository quoteRepo;
    private final WorkOrderNumberGenerator numberGenerator;

    public WorkOrderService(
            WorkOrderRepository woRepo,
            CustomerRepository customerRepo,
            AssetRepository assetRepo,
            QuoteRepository quoteRepo,
            WorkOrderNumberGenerator numberGenerator
    ) {
        this.woRepo = woRepo;
        this.customerRepo = customerRepo;
        this.assetRepo = assetRepo;
        this.quoteRepo = quoteRepo;
        this.numberGenerator = numberGenerator;
    }

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> listar(Long customerId, WorkOrderStatus estado) {
        List<WorkOrder> data;
        if (customerId != null) {
            data = woRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
        } else if (estado != null) {
            data = woRepo.findByEstadoOrderByCreatedAtDesc(estado);
        } else {
            data = woRepo.findAll();
        }
        return data.stream().map(WorkOrderResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public WorkOrderResponse obtener(Long id) {
        return woRepo.findById(id)
                .map(WorkOrderResponse::from)
                .orElseThrow(() -> new WorkOrderNotFoundException(id));
    }

    public WorkOrderResponse crear(WorkOrderRequest req) {
        var customer = customerRepo.findById(req.customerId())
                .orElseThrow(() -> new CustomerNotFoundException(req.customerId()));

        var wo = new WorkOrder();
        wo.setNumero(numberGenerator.generarSiguiente());
        wo.setCustomer(customer);
        wo.setNotas(req.notas());
        wo.setEstado(WorkOrderStatus.ABIERTA);

        // Cotización origen (opcional)
        if (req.quoteId() != null) {
            var quote = quoteRepo.findById(req.quoteId())
                    .orElseThrow(() -> new QuoteNotFoundException(req.quoteId()));
            if (!quote.getCustomer().getId().equals(customer.getId())) {
                throw new IllegalArgumentException(
                        "La cotización " + req.quoteId() + " no pertenece al cliente " + customer.getId()
                );
            }
            wo.setQuote(quote);
        }

        // Asset (opcional)
        if (req.assetId() != null) {
            var asset = assetRepo.findById(req.assetId())
                    .orElseThrow(() -> new AssetNotFoundException(req.assetId()));
            if (!asset.getCustomer().getId().equals(customer.getId())) {
                throw new IllegalArgumentException(
                        "El asset " + req.assetId() + " no pertenece al cliente " + customer.getId()
                );
            }
            wo.setAsset(asset);
        }

        aplicarItems(wo, req.items());
        wo.recalcularTotal();

        return WorkOrderResponse.from(woRepo.save(wo));
    }

    public WorkOrderResponse actualizar(Long id, WorkOrderRequest req) {
        var wo = woRepo.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException(id));

        // Regla: solo se puede editar si está ABIERTA o EN_PROCESO
        if (wo.getEstado() != WorkOrderStatus.ABIERTA
                && wo.getEstado() != WorkOrderStatus.EN_PROCESO) {
            throw new IllegalStateException(
                    "Solo se pueden editar órdenes en estado ABIERTA o EN_PROCESO. Estado actual: " + wo.getEstado()
            );
        }

        // Cambio de cliente
        if (!wo.getCustomer().getId().equals(req.customerId())) {
            var customer = customerRepo.findById(req.customerId())
                    .orElseThrow(() -> new CustomerNotFoundException(req.customerId()));
            wo.setCustomer(customer);
        }

        // Cambio de cotización origen
        if (req.quoteId() == null) {
            wo.setQuote(null);
        } else {
            var quote = quoteRepo.findById(req.quoteId())
                    .orElseThrow(() -> new QuoteNotFoundException(req.quoteId()));
            if (!quote.getCustomer().getId().equals(req.customerId())) {
                throw new IllegalArgumentException(
                        "La cotización " + req.quoteId() + " no pertenece al cliente " + req.customerId()
                );
            }
            wo.setQuote(quote);
        }

        // Cambio de asset
        if (req.assetId() == null) {
            wo.setAsset(null);
        } else {
            var asset = assetRepo.findById(req.assetId())
                    .orElseThrow(() -> new AssetNotFoundException(req.assetId()));
            if (!asset.getCustomer().getId().equals(req.customerId())) {
                throw new IllegalArgumentException(
                        "El asset " + req.assetId() + " no pertenece al cliente " + req.customerId()
                );
            }
            wo.setAsset(asset);
        }

        wo.setNotas(req.notas());
        aplicarItems(wo, req.items());
        wo.recalcularTotal();

        return WorkOrderResponse.from(woRepo.save(wo));
    }

    public WorkOrderResponse cambiarEstado(Long id, WorkOrderStatus nuevoEstado) {
        var wo = woRepo.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException(id));

        var estadoActual = wo.getEstado();

        boolean transicionValida = switch (estadoActual) {
            case ABIERTA -> nuevoEstado == WorkOrderStatus.EN_PROCESO
                    || nuevoEstado == WorkOrderStatus.CANCELADA;
            case EN_PROCESO -> nuevoEstado == WorkOrderStatus.TERMINADA
                    || nuevoEstado == WorkOrderStatus.CANCELADA;
            case TERMINADA -> nuevoEstado == WorkOrderStatus.ENTREGADA;
            case ENTREGADA, CANCELADA -> false; // estados finales
        };

        if (!transicionValida) {
            throw new IllegalStateException(
                    "Transición no permitida: " + estadoActual + " → " + nuevoEstado
            );
        }

        // Fechas automáticas según el estado
        var ahora = OffsetDateTime.now();
        if (nuevoEstado == WorkOrderStatus.TERMINADA && wo.getFechaCierre() == null) {
            wo.setFechaCierre(ahora);
        }
        if (nuevoEstado == WorkOrderStatus.ENTREGADA && wo.getFechaEntrega() == null) {
            wo.setFechaEntrega(ahora);
        }

        wo.setEstado(nuevoEstado);
        return WorkOrderResponse.from(woRepo.save(wo));
    }

    public void eliminar(Long id) {
        var wo = woRepo.findById(id)
                .orElseThrow(() -> new WorkOrderNotFoundException(id));

        // Regla: solo se puede eliminar si está ABIERTA o CANCELADA
        if (wo.getEstado() != WorkOrderStatus.ABIERTA
                && wo.getEstado() != WorkOrderStatus.CANCELADA) {
            throw new IllegalStateException(
                    "Solo se pueden eliminar órdenes en estado ABIERTA o CANCELADA"
            );
        }

        woRepo.delete(wo);
    }

    // --- Helper privado ---

    private void aplicarItems(WorkOrder wo, List<WorkOrderItemRequest> items) {
        var nuevos = new ArrayList<WorkOrderItem>();
        int orden = 0;
        for (var req : items) {
            var item = new WorkOrderItem();
            item.setDescripcion(req.descripcion());
            item.setCantidad(req.cantidad());
            item.setPrecioUnitario(req.precioUnitario());
            item.setOrden(orden++);
            item.recalcularSubtotal();
            nuevos.add(item);
        }
        wo.replaceItems(nuevos);
    }
}