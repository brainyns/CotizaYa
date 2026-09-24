package cotizaciones.app.Model;



import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quotes")
@Getter
@Setter
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String numero;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuoteStatus estado = QuoteStatus.BORRADOR;

    @Column(columnDefinition = "text")
    private String notas;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @OneToMany(
            mappedBy = "quote",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("orden ASC")
    private List<QuoteItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        var now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    /**
     * Agrega un ítem y establece la relación bidireccional.
     */
    public void addItem(QuoteItem item) {
        items.add(item);
        item.setQuote(this);
    }

    /**
     * Reemplaza todos los ítems. Con orphanRemoval, los viejos se borran solos.
     */
    public void replaceItems(List<QuoteItem> nuevos) {
        items.clear();
        for (QuoteItem item : nuevos) {
            addItem(item);
        }
    }

    /**
     * Recalcula el total sumando los subtotales de todos los ítems.
     */
    public void recalcularTotal() {
        this.total = items.stream()
                .map(QuoteItem::getSubtotal)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}