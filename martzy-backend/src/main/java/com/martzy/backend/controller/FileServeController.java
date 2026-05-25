// ─── src/main/java/com/martzy/backend/controller/FileServeController.java ──
package com.martzy.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class FileServeController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Serve any uploaded file by its relative path.
     * e.g. GET /uploads/sellers/aadhar/uuid.jpg
     *
     * Content-type is detected from the file extension so files open
     * correctly in the browser regardless of what the client originally
     * named them.
     */
    @GetMapping("/**")
    public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
        // Extract the sub-path after /uploads/
        String requestURI = request.getRequestURI();
        String subPath = requestURI.replaceFirst("^/uploads/", "");

        try {
            Path filePath = Paths.get(uploadDir).resolve(subPath).normalize();

            // Security: prevent path traversal outside uploadDir
            if (!filePath.startsWith(Paths.get(uploadDir).normalize())) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            MediaType mediaType = detectMediaType(filePath.getFileName().toString());

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private MediaType detectMediaType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf"))               return MediaType.APPLICATION_PDF;
        if (lower.endsWith(".png"))               return MediaType.IMAGE_PNG;
        if (lower.endsWith(".gif"))               return MediaType.IMAGE_GIF;
        if (lower.endsWith(".webp"))              return MediaType.parseMediaType("image/webp");
        // jpg / jpeg / anything else → image/jpeg (most common for phone photos)
        return MediaType.IMAGE_JPEG;
    }
}