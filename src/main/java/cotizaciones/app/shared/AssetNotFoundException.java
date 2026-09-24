package cotizaciones.app.shared;

public class AssetNotFoundException extends RuntimeException {
    public AssetNotFoundException(Long id) {
        super("Asset no encontrado: " + id);
    }
}