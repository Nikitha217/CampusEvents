package com.campusevents.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.EnumMap;
import java.util.Map;

/**
 * QrCodeService — generates PNG QR codes using the ZXing library.
 *
 * QR images are stored at: uploads/qr/{qrCode}.png
 * Served statically at:    /uploads/qr/{qrCode}.png
 */
@Service
public class QrCodeService {

    private static final Logger log = LoggerFactory.getLogger(QrCodeService.class);

    private static final int QR_WIDTH  = 300;
    private static final int QR_HEIGHT = 300;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Generate a QR PNG for the given code and store it on disk.
     *
     * @param qrCode        the text to encode (e.g. "REG12345AB")
     * @param registrationId used only for logging
     * @return relative path stored in Registration.qrImagePath
     */
    public String generateQrImage(String qrCode, String registrationId) throws WriterException, IOException {
        Path dir = Paths.get(uploadDir, "qr");
        Files.createDirectories(dir);

        String filename = qrCode + ".png";
        Path filePath   = dir.resolve(filename);

        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 2);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix    = writer.encode(qrCode, BarcodeFormat.QR_CODE, QR_WIDTH, QR_HEIGHT, hints);

        try (OutputStream os = Files.newOutputStream(filePath)) {
            MatrixToImageWriter.writeToStream(matrix, "PNG", os);
        }

        String relativePath = "uploads/qr/" + filename;
        log.info("[QrCodeService] Generated QR for registration {}: {}", registrationId, relativePath);
        return relativePath;
    }

    /**
     * Get the URL path to serve the QR image (for frontend display / download).
     */
    public String getQrImageUrl(String qrImagePath) {
        if (qrImagePath == null) return null;
        return "/" + qrImagePath;
    }

    /**
     * Delete QR image from disk (e.g. on registration cancel).
     */
    public void deleteQrImage(String qrImagePath) {
        if (qrImagePath == null) return;
        try {
            Path p = Paths.get(qrImagePath);
            Files.deleteIfExists(p);
        } catch (IOException e) {
            log.warn("[QrCodeService] Could not delete QR image {}: {}", qrImagePath, e.getMessage());
        }
    }
}
