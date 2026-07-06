package com.campusevents.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * FileStorageService — generic file storage utility.
 *
 * Stores files under: {upload-dir}/{subDir}/{uuid}_{original-filename}
 * Serves them as static resources via /uploads/** mapping in WebConfig.
 */
@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Store a multipart file and return the relative path.
     *
     * @param file   the uploaded file
     * @param subDir e.g. "events" or "feedback"
     * @return relative path like "uploads/events/uuid_photo.jpg"
     */
    public String storeFile(MultipartFile file, String subDir) throws IOException {
        Path dir = Paths.get(uploadDir, subDir);
        Files.createDirectories(dir);

        String original = file.getOriginalFilename();
        String filename  = UUID.randomUUID() + "_" + sanitize(original);
        Path   targetPath = dir.resolve(filename);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return uploadDir + "/" + subDir + "/" + filename;
    }

    /**
     * Delete a file given its relative path.
     */
    public void deleteFile(String relativePath) {
        if (relativePath == null) return;
        try {
            Files.deleteIfExists(Paths.get(relativePath));
        } catch (IOException ignored) {}
    }

    private String sanitize(String name) {
        if (name == null) return "file";
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
