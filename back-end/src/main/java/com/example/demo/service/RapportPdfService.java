package com.example.demo.service;

import com.example.demo.dto.RapportInterventionResponse;
import com.lowagie.text.BadElementException;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RapportPdfService {

    private static final String LOGO_CLASSPATH = "static/logo.png";
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Color LABEL_BG = new Color(240, 242, 246);

    public record RapportPhoto(Resource resource, String nomOriginal) {
    }

    public byte[] generateRapportPdf(RapportInterventionResponse rapport, List<RapportPhoto> photos) {
        Document document = new Document(PageSize.A4, 40, 40, 54, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();
            addHeader(document, rapport);
            addFields(document, rapport);
            addPhotos(document, photos);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
        return out.toByteArray();
    }

    private void addHeader(Document document, RapportInterventionResponse rapport) throws DocumentException {
        Image logo = loadLogo();
        if (logo != null) {
            logo.scaleToFit(90, 90);
            document.add(logo);
        }

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Paragraph title = new Paragraph("Rapport d'intervention — " + rapport.getInterventionTitre(), titleFont);
        title.setSpacingBefore(logo != null ? 8 : 0);
        title.setSpacingAfter(4);
        document.add(title);

        Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.ITALIC);
        Paragraph generatedAt = new Paragraph(
                "Généré le " + LocalDateTime.now().format(DATETIME_FORMAT), dateFont);
        generatedAt.setSpacingAfter(16);
        document.add(generatedAt);
    }

    private Image loadLogo() {
        try {
            ClassPathResource resource = new ClassPathResource(LOGO_CLASSPATH);
            if (!resource.exists()) {
                return null;
            }
            return Image.getInstance(resource.getURL());
        } catch (IOException e) {
            return null;
        }
    }

    private void addFields(Document document, RapportInterventionResponse rapport) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{1, 2});
        table.setWidthPercentage(100);

        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        String technicien = (nullToEmpty(rapport.getTechnicienPrenom()) + " " + nullToEmpty(rapport.getTechnicienNom())).trim();

        addRow(table, "Technicien", technicien.isEmpty() ? "—" : technicien, labelFont, valueFont);
        addRow(table, "Date de début", formatDateTime(rapport.getDateDebut()), labelFont, valueFont);
        addRow(table, "Date de fin", formatDateTime(rapport.getDateFin()), labelFont, valueFont);
        addRow(table, "Description des travaux", orDash(rapport.getDescriptionTravaux()), labelFont, valueFont);
        addRow(table, "Matériel utilisé", orDash(rapport.getMaterielUtilise()), labelFont, valueFont);
        addRow(table, "Difficultés rencontrées", orDash(rapport.getDifficultesRencontrees()), labelFont, valueFont);
        addRow(table, "Solution appliquée", orDash(rapport.getSolutionAppliquee()), labelFont, valueFont);
        addRow(table, "Observations", orDash(rapport.getObservations()), labelFont, valueFont);

        document.add(table);
    }

    private void addPhotos(Document document, List<RapportPhoto> photos) throws DocumentException {
        if (photos == null || photos.isEmpty()) {
            return;
        }

        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Paragraph sectionTitle = new Paragraph("Photos", sectionFont);
        sectionTitle.setSpacingBefore(20);
        sectionTitle.setSpacingAfter(8);
        document.add(sectionTitle);

        Font captionFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Font.ITALIC);

        for (RapportPhoto photo : photos) {
            try {
                Image image = Image.getInstance(photo.resource().getURL());
                image.scaleToFit(400, 300);
                image.setSpacingAfter(4);
                document.add(image);

                if (photo.nomOriginal() != null && !photo.nomOriginal().isBlank()) {
                    Paragraph caption = new Paragraph(photo.nomOriginal(), captionFont);
                    caption.setSpacingAfter(14);
                    document.add(caption);
                }
            } catch (IOException | BadElementException e) {
                // Photo illisible ou corrompue sur le disque : on l'ignore et on continue le rapport.
            }
        }
    }

    private void addRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBackgroundColor(LABEL_BG);
        labelCell.setPadding(6);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setPadding(6);
        table.addCell(valueCell);
    }

    private String formatDateTime(LocalDateTime value) {
        return value != null ? value.format(DATETIME_FORMAT) : "—";
    }

    private String orDash(String value) {
        return (value == null || value.isBlank()) ? "—" : value;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
