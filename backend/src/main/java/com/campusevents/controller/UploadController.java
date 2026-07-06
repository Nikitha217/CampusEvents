package com.campusevents.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    // POST /api/upload
    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Please select a file to upload");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        try {
            // 1. Create uploads/events directory if it doesn't exist
            String uploadDirectory = "uploads/events";
            File dir = new File(uploadDirectory);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 2. Generate a unique filename using timestamp
            String originalFilename = file.getOriginalFilename();
            String cleanFilename = originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_") : "file";
            String newFilename = System.currentTimeMillis() + "_" + cleanFilename;

            // 3. Save file to disk
            Path path = Paths.get(uploadDirectory, newFilename);
            Files.copy(file.getInputStream(), path);

            // 4. Construct relative URL
            String fileUrl = "/uploads/events/" + newFilename;

            // 5. Return URL JSON
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to store file: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
