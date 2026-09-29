package cotizaciones.app.Service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import cotizaciones.app.Model.BusinessSettings;
import cotizaciones.app.Model.WorkOrder;
import cotizaciones.app.Repository.BusinessSettingsRepository;
import cotizaciones.app.Repository.WorkOrderRepository;
import cotizaciones.app.shared.WorkOrderNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class WorkOrderPdfService {

    private final WorkOrderRepository woRepo;
    private final BusinessSettingsRepository settingsRepo;

    public WorkOrderPdfService(
            WorkOrderRepository woRepo,
            BusinessSettingsRepository settingsRepo
    ) {
        this.woRepo = woRepo;
        this.settingsRepo = settingsRepo;
    }

    public byte[] generarPdf(Long workOrderId) {
        var wo = woRepo.findById(workOrderId)
                .orElseThrow(() -> new WorkOrderNotFoundException(workOrderId));

        var settings = settingsRepo.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No hay configuracion del taller"));

        try (var out = new ByteArrayOutputStream()) {
            var document = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            agregarEncabezado(document, settings, wo);
            agregarInfoOrden(document, wo);
            agregarInfoCliente(document, wo);
            agregarFechas(document, wo);
            agregarTablaItems(document, wo);
            agregarNotas(document, wo, settings);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generando PDF: " + e.getMessage(), e);
        }
    }

    private void agregarEncabezado(Document doc, BusinessSettings s, WorkOrder wo) throws DocumentException {
        var tabla = new PdfPTable(2);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{1f, 3f});

        var logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        if (s.getLogoBase64() != null && s.getLogoBase64().contains(",")) {
            try {
                var base64Data = s.getLogoBase64().split(",")[1];
                var imageBytes = java.util.Base64.getDecoder().decode(base64Data);
                var img = Image.getInstance(imageBytes);
                img.scaleToFit(100, 100);
                logoCell.addElement(img);
            } catch (Exception e) {
                // sin logo
            }
        }
        tabla.addCell(logoCell);

        var infoCell = new PdfPCell();
        infoCell.setBorder(Rectangle.NO_BORDER);

        infoCell.addElement(new Paragraph(
                s.getNombreTaller(),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)
        ));

        var fuenteInfo = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
        if (s.getNit() != null && !s.getNit().isBlank()) {
            infoCell.addElement(new Paragraph("NIT: " + s.getNit(), fuenteInfo));
        }
        if ((s.getDireccion() != null && !s.getDireccion().isBlank())
                || (s.getCiudad() != null && !s.getCiudad().isBlank())) {
            var direccion = (s.getDireccion() != null ? s.getDireccion() : "")
                    + (s.getCiudad() != null ? ", " + s.getCiudad() : "");
            infoCell.addElement(new Paragraph(direccion, fuenteInfo));
        }
        if ((s.getTelefono() != null && !s.getTelefono().isBlank())
                || (s.getEmail() != null && !s.getEmail().isBlank())) {
            var contacto = (s.getTelefono() != null ? "Tel: " + s.getTelefono() : "")
                    + (s.getEmail() != null ? " · " + s.getEmail() : "");
            infoCell.addElement(new Paragraph(contacto, fuenteInfo));
        }

        tabla.addCell(infoCell);
        doc.add(tabla);

        doc.add(Chunk.NEWLINE);
        var titulo = new Paragraph(
                "ORDEN DE TRABAJO " + wo.getNumero(),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)
        );
        titulo.setAlignment(Element.ALIGN_RIGHT);
        doc.add(titulo);
    }

    private void agregarInfoOrden(Document doc, WorkOrder wo) throws DocumentException {
        var fuente = FontFactory.getFont(FontFactory.HELVETICA, 10);
        var fuenteBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
        doc.add(Chunk.NEWLINE);

        var estado = new Paragraph("Estado: " + estadoLegible(wo.getEstado().name()), fuenteBold);
        estado.setAlignment(Element.ALIGN_RIGHT);
        doc.add(estado);

        if (wo.getQuote() != null) {
            var ref = new Paragraph(
                    "Ref. cotizacion: " + wo.getQuote().getNumero(),
                    fuente
            );
            ref.setAlignment(Element.ALIGN_RIGHT);
            doc.add(ref);
        }
    }

    private void agregarInfoCliente(Document doc, WorkOrder wo) throws DocumentException {
        doc.add(Chunk.NEWLINE);
        var fuenteLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        var fuente = FontFactory.getFont(FontFactory.HELVETICA, 10);

        doc.add(new Paragraph("CLIENTE", fuenteLabel));
        doc.add(new Paragraph(wo.getCustomer().getNombre(), fuente));

        var contacto = "";
        if (wo.getCustomer().getTelefono() != null) {
            contacto += "Tel: " + wo.getCustomer().getTelefono();
        }
        if (wo.getCustomer().getEmail() != null) {
            contacto += (contacto.isEmpty() ? "" : " · ") + wo.getCustomer().getEmail();
        }
        if (!contacto.isEmpty()) {
            doc.add(new Paragraph(contacto, fuente));
        }

        if (wo.getAsset() != null) {
            doc.add(Chunk.NEWLINE);
            doc.add(new Paragraph("VEHICULO / EQUIPO", fuenteLabel));

            var assetDesc = "";
            if (wo.getAsset().getMarca() != null) assetDesc += wo.getAsset().getMarca() + " ";
            if (wo.getAsset().getModelo() != null) assetDesc += wo.getAsset().getModelo() + " ";
            if (wo.getAsset().getPlacaSerial() != null) assetDesc += "(" + wo.getAsset().getPlacaSerial() + ")";
            if (wo.getAsset().getAnio() != null) assetDesc += " - " + wo.getAsset().getAnio();

            doc.add(new Paragraph(assetDesc.trim(), fuente));
        }
    }

    private void agregarFechas(Document doc, WorkOrder wo) throws DocumentException {
        doc.add(Chunk.NEWLINE);

        var formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                .withZone(ZoneId.systemDefault());
        var fuenteLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
        var fuente = FontFactory.getFont(FontFactory.HELVETICA, 9);

        var tabla = new PdfPTable(3);
        tabla.setWidthPercentage(100);

        tabla.addCell(fechaCell("APERTURA", formatter.format(wo.getFechaApertura()), fuenteLabel, fuente));
        tabla.addCell(fechaCell(
                "CIERRE",
                wo.getFechaCierre() != null ? formatter.format(wo.getFechaCierre()) : "—",
                fuenteLabel, fuente
        ));
        tabla.addCell(fechaCell(
                "ENTREGA",
                wo.getFechaEntrega() != null ? formatter.format(wo.getFechaEntrega()) : "—",
                fuenteLabel, fuente
        ));

        doc.add(tabla);
    }

    private PdfPCell fechaCell(String label, String valor, Font fuenteLabel, Font fuente) {
        var cell = new PdfPCell();
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(Color.LIGHT_GRAY);
        cell.setPadding(8);
        cell.addElement(new Paragraph(label, fuenteLabel));
        cell.addElement(new Paragraph(valor, fuente));
        return cell;
    }

    private void agregarTablaItems(Document doc, WorkOrder wo) throws DocumentException {
        doc.add(Chunk.NEWLINE);

        var tabla = new PdfPTable(4);
        tabla.setWidthPercentage(100);
        tabla.setWidths(new float[]{5f, 1f, 2f, 2f});

        var fuenteHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
        var bgHeader = new Color(37, 99, 235);

        tabla.addCell(headerCell("DESCRIPCION", fuenteHeader, bgHeader, Element.ALIGN_LEFT));
        tabla.addCell(headerCell("CANT", fuenteHeader, bgHeader, Element.ALIGN_RIGHT));
        tabla.addCell(headerCell("PRECIO UNIT", fuenteHeader, bgHeader, Element.ALIGN_RIGHT));
        tabla.addCell(headerCell("SUBTOTAL", fuenteHeader, bgHeader, Element.ALIGN_RIGHT));

        var fuenteCell = FontFactory.getFont(FontFactory.HELVETICA, 10);
        for (var item : wo.getItems()) {
            tabla.addCell(bodyCell(item.getDescripcion(), fuenteCell, Element.ALIGN_LEFT));
            tabla.addCell(bodyCell(formatCantidad(item.getCantidad()), fuenteCell, Element.ALIGN_RIGHT));
            tabla.addCell(bodyCell(formatMoney(item.getPrecioUnitario()), fuenteCell, Element.ALIGN_RIGHT));
            tabla.addCell(bodyCell(formatMoney(item.getSubtotal()), fuenteCell, Element.ALIGN_RIGHT));
        }

        var fuenteTotal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        var celdaLabel = new PdfPCell(new Phrase("TOTAL", fuenteTotal));
        celdaLabel.setColspan(3);
        celdaLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        celdaLabel.setBorder(Rectangle.NO_BORDER);
        celdaLabel.setPaddingTop(10);
        tabla.addCell(celdaLabel);

        var celdaTotal = new PdfPCell(new Phrase(formatMoney(wo.getTotal()), fuenteTotal));
        celdaTotal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        celdaTotal.setBorder(Rectangle.NO_BORDER);
        celdaTotal.setPaddingTop(10);
        tabla.addCell(celdaTotal);

        doc.add(tabla);
    }

    private void agregarNotas(Document doc, WorkOrder wo, BusinessSettings s) throws DocumentException {
        if (wo.getNotas() != null && !wo.getNotas().isBlank()) {
            doc.add(Chunk.NEWLINE);
            var fuenteLabel = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            var fuente = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            doc.add(new Paragraph("Notas", fuenteLabel));
            doc.add(new Paragraph(wo.getNotas(), fuente));
        }

        if (s.getNotasPie() != null && !s.getNotasPie().isBlank()) {
            doc.add(Chunk.NEWLINE);
            doc.add(Chunk.NEWLINE);
            var fuente = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);
            var notas = new Paragraph(s.getNotasPie(), fuente);
            notas.setAlignment(Element.ALIGN_CENTER);
            doc.add(notas);
        }
    }

    private PdfPCell headerCell(String texto, Font fuente, Color bg, int align) {
        var cell = new PdfPCell(new Phrase(texto, fuente));
        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(align);
        cell.setPadding(8);
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }

    private PdfPCell bodyCell(String texto, Font fuente, int align) {
        var cell = new PdfPCell(new Phrase(texto, fuente));
        cell.setHorizontalAlignment(align);
        cell.setPadding(6);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColorBottom(Color.LIGHT_GRAY);
        return cell;
    }

    private String formatMoney(BigDecimal value) {
        if (value == null) return "$ 0";
        var format = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));
        format.setMaximumFractionDigits(0);
        return format.format(value);
    }

    private String formatCantidad(BigDecimal value) {
        if (value == null) return "0";
        return value.stripTrailingZeros().toPlainString();
    }

    private String estadoLegible(String estado) {
        return switch (estado) {
            case "ABIERTA" -> "Abierta";
            case "EN_PROCESO" -> "En proceso";
            case "TERMINADA" -> "Terminada";
            case "ENTREGADA" -> "Entregada";
            case "CANCELADA" -> "Cancelada";
            default -> estado;
        };
    }
}