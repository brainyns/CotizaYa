package cotizaciones.app.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "work_orders")
@Getter
@Setter
public class WorkOrder {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id")
    private Quote quote;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkOrderStatus estado = WorkOrderStatus.ABIERTA;

    @Column(columnDefinition = "text")
    private String notas;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "fecha_apertura", nullable = false)
    private OffsetDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private OffsetDateTime fechaCierre;

    @Column(name = "fecha_entrega")
    private OffsetDateTime fechaEntrega;

    @OneToMany(
            mappedBy = "workOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("orden ASC")
    private List<WorkOrderItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        var now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (fechaApertura == null) {
            fechaApertura = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    // --- Métodos de negocio ---

    public void addItem(WorkOrderItem item) {
        items.add(item);
        item.setWorkOrder(this);
    }

    public void replaceItems(List<WorkOrderItem> nuevos) {
        items.clear();
        for (WorkOrderItem item : nuevos) {
            addItem(item);
        }
    }

    public void recalcularTotal() {
        this.total = items.stream()
                .map(WorkOrderItem::getSubtotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
