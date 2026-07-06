package com.campusevents.service;

import com.campusevents.entity.Certificate;
import com.campusevents.entity.User;
import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.exception.ResourceNotFoundException;
import com.campusevents.repository.CertificateRepository;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.repository.UserRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;
    private final EventRepository eventRepository;

    public CertificateService(
            CertificateRepository certificateRepository,
            UserRepository userRepository,
            RegistrationRepository registrationRepository,
            NotificationService notificationService,
            EventRepository eventRepository
    ) {
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
        this.registrationRepository = registrationRepository;
        this.notificationService = notificationService;
        this.eventRepository = eventRepository;
    }

    public Certificate generateCertificate(
            String studentId,
            String studentName,
            String eventId,
            String eventTitle
    ) {
        String resolvedStudentId = studentId;

        if (studentId != null && studentId.contains("@")) {
            Optional<User> userOpt = userRepository.findByEmail(studentId);
            if (userOpt.isPresent()) {
                resolvedStudentId = userOpt.get().getId().toString();
            }
        }

        Event event = eventRepository.findById(eventId).orElse(null);
        String eventDate = event != null && event.getStartDate() != null ? event.getStartDate() : 
                           LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));

        String certificateId = generateCertificateId();

        File dir = new File("uploads/certificates");
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = "cert_" + resolvedStudentId + "_" + eventId + "_" + System.currentTimeMillis() + ".pdf";
        String absolutePath = dir.getAbsolutePath() + File.separator + fileName;
        String certificateUrl = "/uploads/certificates/" + fileName;

        try (FileOutputStream fos = new FileOutputStream(absolutePath)) {
            // Setting zero margins disables automatic pagination, completely guaranteeing 1 page
            Document document = new Document(PageSize.A4.rotate(), 0, 0, 0, 0);
            PdfWriter writer = PdfWriter.getInstance(document, fos);
            document.open();

            Color navyBlue = Color.decode("#0F172A");
            Color gold = Color.decode("#D97706");
            Color slateGray = Color.decode("#64748B");
            Color darkGray = Color.decode("#334155");

            // Fonts
            Font headerFont = new Font(Font.HELVETICA, 32, Font.BOLD, navyBlue);
            Font titleFont = new Font(Font.TIMES_ROMAN, 24, Font.BOLD, gold);
            Font nameFont = new Font(Font.HELVETICA, 32, Font.BOLD, navyBlue);
            Font bodyFont = new Font(Font.TIMES_ROMAN, 14, Font.NORMAL, darkGray);
            Font eventFont = new Font(Font.HELVETICA, 18, Font.BOLD, navyBlue);
            Font metaFont = new Font(Font.HELVETICA, 10, Font.BOLD, slateGray);
            Font signFont = new Font(Font.TIMES_ROMAN, 12, Font.NORMAL, darkGray);
            Font signLabelFont = new Font(Font.HELVETICA, 10, Font.BOLD, navyBlue);
            Font footerFont = new Font(Font.HELVETICA, 10, Font.NORMAL, slateGray);

            // Watermark (background)
            PdfContentByte canvas = writer.getDirectContentUnder();
            canvas.saveState();
            canvas.setColorFill(new Color(241, 245, 249, 100)); 
            canvas.beginText();
            canvas.setFontAndSize(BaseFont.createFont(BaseFont.HELVETICA_BOLD, BaseFont.WINANSI, BaseFont.EMBEDDED), 120);
            canvas.showTextAligned(Element.ALIGN_CENTER, "EVENTORA", PageSize.A4.rotate().getWidth() / 2, PageSize.A4.rotate().getHeight() / 2, 35);
            canvas.endText();
            canvas.restoreState();

            // Borders
            PdfContentByte over = writer.getDirectContent();
            float w = PageSize.A4.rotate().getWidth(); // 842
            float h = PageSize.A4.rotate().getHeight(); // 595
            
            over.setLineWidth(4);
            over.setColorStroke(navyBlue);
            over.rectangle(20, 20, w - 40, h - 40);
            over.stroke();
            
            over.setLineWidth(1);
            over.setColorStroke(gold);
            over.rectangle(25, 25, w - 50, h - 50);
            over.stroke();

            // Master Layout Table (85% width = ~715pt)
            float tableWidth = w * 0.85f;
            PdfPTable masterTable = new PdfPTable(1);
            masterTable.setTotalWidth(tableWidth);
            masterTable.setLockedWidth(true);
            
            // 1. HEADER
            Paragraph pHeader = new Paragraph("EVENTORA", headerFont);
            pHeader.setAlignment(Element.ALIGN_CENTER);
            PdfPCell headerCell = new PdfPCell(pHeader);
            headerCell.setBorder(Rectangle.NO_BORDER);
            headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            headerCell.setPaddingBottom(10);
            masterTable.addCell(headerCell);

            // 2. TITLE
            Paragraph pTitle = new Paragraph("CERTIFICATE OF COMPLETION", titleFont);
            pTitle.setAlignment(Element.ALIGN_CENTER);
            PdfPCell titleCell = new PdfPCell(pTitle);
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            titleCell.setPaddingBottom(20);
            masterTable.addCell(titleCell);

            // 3. STUDENT NAME
            String safeStudentName = studentName == null ? "STUDENT" : studentName.toUpperCase();
            Paragraph pName = new Paragraph(safeStudentName, nameFont);
            pName.setAlignment(Element.ALIGN_CENTER);
            PdfPCell nameCell = new PdfPCell(pName);
            nameCell.setBorder(Rectangle.NO_BORDER);
            nameCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            nameCell.setPaddingBottom(15);
            masterTable.addCell(nameCell);

            // 4. PRESENTATION TEXT
            Paragraph pBody = new Paragraph("This certificate is proudly presented for\nsuccessfully participating in", bodyFont);
            pBody.setAlignment(Element.ALIGN_CENTER);
            PdfPCell bodyCell = new PdfPCell(pBody);
            bodyCell.setBorder(Rectangle.NO_BORDER);
            bodyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            bodyCell.setPaddingBottom(15);
            masterTable.addCell(bodyCell);

            // 5. EVENT NAME
            Paragraph pEvent = new Paragraph(eventTitle.toUpperCase(), eventFont);
            pEvent.setAlignment(Element.ALIGN_CENTER);
            PdfPCell eventCell = new PdfPCell(pEvent);
            eventCell.setBorder(Rectangle.NO_BORDER);
            eventCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            eventCell.setPaddingBottom(15);
            masterTable.addCell(eventCell);

            // 6. DATE
            Paragraph pDate = new Paragraph("Conducted on " + eventDate, bodyFont);
            pDate.setAlignment(Element.ALIGN_CENTER);
            PdfPCell dateCell = new PdfPCell(pDate);
            dateCell.setBorder(Rectangle.NO_BORDER);
            dateCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            dateCell.setPaddingBottom(20);
            masterTable.addCell(dateCell);

            // 7. CERT ID & ISSUE DATE
            String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
            Paragraph pMeta = new Paragraph("Certificate ID: " + certificateId + "   |   Issue Date: " + today, metaFont);
            pMeta.setAlignment(Element.ALIGN_CENTER);
            PdfPCell metaCell = new PdfPCell(pMeta);
            metaCell.setBorder(Rectangle.NO_BORDER);
            metaCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            metaCell.setPaddingBottom(35); // Generous spacing before footer
            masterTable.addCell(metaCell);

            // 8. SIGNATURES ROW (QR, Coordinator, Organizer)
            PdfPTable sigTable = new PdfPTable(3);
            sigTable.setWidthPercentage(100);
            sigTable.setWidths(new float[]{1f, 1.5f, 1.5f});

            // QR Code
            PdfPCell qrCell = new PdfPCell();
            qrCell.setBorder(Rectangle.NO_BORDER);
            qrCell.setHorizontalAlignment(Element.ALIGN_LEFT);
            qrCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
            try {
                String qrData = "ID: " + certificateId + "\nName: " + safeStudentName + "\nEvent: " + eventTitle;
                byte[] qrCodeImage = generateQRCodeImage(qrData, 80, 80);
                Image qrImage = Image.getInstance(qrCodeImage);
                qrImage.setAlignment(Element.ALIGN_LEFT);
                qrCell.addElement(qrImage);
            } catch (Exception e) {}
            sigTable.addCell(qrCell);

            // Coordinator Signature
            PdfPCell coordCell = new PdfPCell();
            coordCell.setBorder(Rectangle.NO_BORDER);
            coordCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            coordCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
            Paragraph sig1Line = new Paragraph("____________________", signFont);
            sig1Line.setAlignment(Element.ALIGN_CENTER);
            Paragraph sig1Label = new Paragraph("Coordinator Signature", signLabelFont);
            sig1Label.setAlignment(Element.ALIGN_CENTER);
            coordCell.addElement(sig1Line);
            coordCell.addElement(sig1Label);
            sigTable.addCell(coordCell);

            // Organizer Signature
            PdfPCell orgCell = new PdfPCell();
            orgCell.setBorder(Rectangle.NO_BORDER);
            orgCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            orgCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
            Paragraph sig2Line = new Paragraph("____________________", signFont);
            sig2Line.setAlignment(Element.ALIGN_RIGHT);
            Paragraph sig2Label = new Paragraph("Event Organizer", signLabelFont);
            sig2Label.setAlignment(Element.ALIGN_RIGHT);
            orgCell.addElement(sig2Line);
            orgCell.addElement(sig2Label);
            sigTable.addCell(orgCell);

            PdfPCell sigMasterCell = new PdfPCell(sigTable);
            sigMasterCell.setBorder(Rectangle.NO_BORDER);
            sigMasterCell.setPaddingBottom(30);
            masterTable.addCell(sigMasterCell);

            // 9. FOOTER
            Paragraph pFooter = new Paragraph("Eventora | Verify Online", footerFont);
            pFooter.setAlignment(Element.ALIGN_CENTER);
            PdfPCell footerCell = new PdfPCell(pFooter);
            footerCell.setBorder(Rectangle.NO_BORDER);
            footerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            masterTable.addCell(footerCell);

            // ABSOLUTE RENDERING: This completely bypasses pagination
            // 550 is the starting Y position from the top (595 height - 45px padding)
            masterTable.writeSelectedRows(0, -1, (w - tableWidth) / 2, 545, writer.getDirectContent());

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF Certificate", e);
        }

        Certificate savedCertificate;
        Optional<Certificate> existingCert = certificateRepository.findFirstByStudentIdAndEventId(resolvedStudentId, eventId);
        if (existingCert.isPresent()) {
            Certificate c = existingCert.get();
            c.setCertificateUrl(certificateUrl);
            c.setCertificateId(certificateId);
            savedCertificate = certificateRepository.save(c);
        } else {
            Certificate certificate = new Certificate(
                    resolvedStudentId,
                    studentName,
                    eventId,
                    eventTitle,
                    certificateUrl,
                    certificateId
            );
            savedCertificate = certificateRepository.save(certificate);
        }

        try {
            registrationRepository.findByStudentEmailAndEventId(studentId, eventId).ifPresent(registration -> {
                registration.setCertificateIssued(true);
                registrationRepository.save(registration);
            });
        } catch (Exception e) {}

        try {
            notificationService.create(resolvedStudentId, "STUDENT", "Certificate Issued", "Your certificate for " + eventTitle + " is ready.", "CERTIFICATE", savedCertificate.getId());
        } catch (Exception e) {}

        return savedCertificate;
    }

    private String generateCertificateId() {
        int year = LocalDateTime.now().getYear();
        int randomNum = 10000 + new Random().nextInt(90000); 
        return "CERT-" + year + "-" + randomNum;
    }

    private byte[] generateQRCodeImage(String text, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        var bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    public List<Certificate> getCertificatesByStudentId(String studentId) {
        return certificateRepository.findByStudentId(studentId);
    }

    public Certificate getCertificateById(String id) {
        return certificateRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Certificate not found with ID: " + id));
    }
}