// ─── src/main/java/com/martzy/backend/controller/ProductController.java ────
package com.martzy.backend.controller;

import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    // ── GET /api/products/all  ─ Public: all active products for customers ─
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAllProducts() {
        ApiResponse response = productService.getAllActiveProducts();
        return ResponseEntity.ok(response);
    }

    // ── GET /api/products/seller  ─ Seller: own products list ─────────────
    @GetMapping("/seller")
    public ResponseEntity<ApiResponse> getSellerProducts(
            @RequestHeader("Authorization") String token
    ) {
        try {
            ApiResponse response = productService.getSellerProducts(token);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── POST /api/products/add  ─ Seller: add product (multipart) ─────────
    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addProduct(
            @RequestHeader("Authorization") String token,
            @RequestParam("name")                              String name,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("price")                             Double price,
            @RequestParam(value = "discountPercent", required = false, defaultValue = "0") Double discountPercent,
            @RequestParam("stock")                             Integer stock,
            @RequestParam("category")                          String category,
            @RequestParam(value = "subcategory", required = false, defaultValue = "") String subcategory,
            @RequestParam(value = "sku",           required = false, defaultValue = "") String sku,
            @RequestParam(value = "weight",        required = false, defaultValue = "") String weight,
            @RequestParam(value = "size",          required = false, defaultValue = "") String size,
            @RequestParam(value = "material",      required = false, defaultValue = "") String material,
            @RequestParam(value = "color",         required = false, defaultValue = "") String color,
            @RequestParam(value = "deliveryInfo",  required = false, defaultValue = "Delivery in 3–5 days") String deliveryInfo,
            @RequestParam(value = "returnPolicy",  required = false, defaultValue = "7 days replacement available") String returnPolicy,
            @RequestParam(value = "image",         required = false) MultipartFile image
    ) {
        try {
            ApiResponse response = productService.addProduct(
                    token, name, description, price, discountPercent, stock,
                    category, subcategory, sku, weight, size, material, color,
                    deliveryInfo, returnPolicy, image
            );
            int status = response.isSuccess() ? 201 : 400;
            return ResponseEntity.status(status).body(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── PUT /api/products/{id}  ─ Seller: update product ──────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestParam(value = "name",          required = false) String name,
            @RequestParam(value = "description",   required = false) String description,
            @RequestParam(value = "price",         required = false) Double price,
            @RequestParam(value = "discountPercent", required = false) Double discountPercent,
            @RequestParam(value = "stock",         required = false) Integer stock,
            @RequestParam(value = "category",      required = false) String category,
            @RequestParam(value = "subcategory",   required = false) String subcategory,
            @RequestParam(value = "sku",           required = false) String sku,
            @RequestParam(value = "weight",        required = false) String weight,
            @RequestParam(value = "size",          required = false) String size,
            @RequestParam(value = "material",      required = false) String material,
            @RequestParam(value = "color",         required = false) String color,
            @RequestParam(value = "deliveryInfo",  required = false) String deliveryInfo,
            @RequestParam(value = "returnPolicy",  required = false) String returnPolicy,
            @RequestParam(value = "image",         required = false) MultipartFile image
    ) {
        try {
            ApiResponse response = productService.updateProduct(
                    token, id, name, description, price, discountPercent, stock,
                    category, subcategory, sku, weight, size, material, color,
                    deliveryInfo, returnPolicy, image
            );
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── PATCH /api/products/{id}/toggle  ─ Seller: toggle active ──────────
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse> toggleProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        try {
            ApiResponse response = productService.toggleProductActive(token, id);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.error(ex.getReason()));
        }
    }

    // ── DELETE /api/products/{id}  ─ Seller: delete product ───────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        try {
            ApiResponse response = productService.deleteProduct(token, id);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.error(ex.getReason()));
        }
    }
}
