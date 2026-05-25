// ─── src/main/java/com/martzy/backend/service/FileStorageService.java ──────
package com.martzy.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final Map<String, String> MIME_TO_EXT = Map.of(
        "image/jpeg",       "jpg",
        "image/jpg",        "jpg",
        "image/png",        "png",
        "image/gif",        "gif",
        "image/webp",       "webp",
        "application/pdf",  "pdf"
    );

    /**
     * Save a file and return its stored relative path.
     * Returns null if file is null/empty.
     * Throws IOException on any storage error (caller should handle).
     */
    public String store(MultipartFile file, String subFolder) throws IOException {
        if (file == null || file.isEmpty()) {
            log.warn("[FileStorage] Skipping empty/null file for subfolder={}", subFolder);
            return null;
        }

        if (uploadDir == null || uploadDir.isBlank()) {
            throw new IOException("app.upload.dir is not configured in application.properties!");
        }

        String ext = resolveExtension(file);

        // Build absolute path
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(subFolder);
        Files.createDirectories(dir);

        String filename = UUID.randomUUID() + "." + ext;
        Path target = dir.resolve(filename);

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String relativePath = subFolder + "/" + filename;
        log.info("[FileStorage] Saved '{}' ({} bytes) → {}", file.getOriginalFilename(), file.getSize(), target);

        return relativePath;  // stored in DB, used to build URL later
    }

    private String resolveExtension(MultipartFile file) {
        // 1. Trust content type first
        String mime = file.getContentType();
        if (mime != null) {
            String fromMime = MIME_TO_EXT.get(mime.toLowerCase().trim());
            if (fromMime != null) return fromMime;
        }

        // 2. Fall back to filename extension
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            String rawExt = original.substring(original.lastIndexOf(".") + 1).toLowerCase().trim();
            if (MIME_TO_EXT.containsValue(rawExt) || rawExt.equals("jpeg")) {
                return rawExt.equals("jpeg") ? "jpg" : rawExt;
            }
        }

        log.warn("[FileStorage] Could not determine extension for file='{}', mime='{}' — defaulting to jpg",
                file.getOriginalFilename(), mime);
        return "jpg";
    }
}
