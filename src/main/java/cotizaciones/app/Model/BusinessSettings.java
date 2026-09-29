package cotizaciones.app.Model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "business_settings")
@Getter
@Setter
public class BusinessSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_taller", nullable = false, length = 120)
    private String nombreTaller;

    @Column(length = 30)
    private String nit;

    @Column(length = 30)
    private String telefono;

    @Column(length = 120)
    private String email;

    @Column(length = 200)
    private String direccion;

    @Column(length = 80)
    private String ciudad;

    @Column(name = "notas_pie", columnDefinition = "text")
    private String notasPie;

    @Column(name = "logo_base64", columnDefinition = "text")
    private String logoBase64;

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
}