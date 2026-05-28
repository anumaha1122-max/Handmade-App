// ─── src/main/java/com/martzy/backend/service/ProductService.java ───────────
package com.martzy.backend.service;

import com.martzy.backend.model.Product;
import com.martzy.backend.model.Seller;
import com.martzy.backend.repository.ProductRepository;
import com.martzy.backend.repository.SellerRepository;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;

    // ── Add a product (called by seller after payment) ────────────────────
    public ApiResponse addProduct(
            String token,
            String name,
            String description,
            Double price,
            Double discountPercent,
            Integer stock,
            String category,
            String subcategory,
            String sku,
            String weight,
            String size,
            String material,
            String color,
            String deliveryInfo,
            String returnPolicy,
            MultipartFile image
    ) {
        // Validate seller from JWT
        Long sellerId = extractSellerId(token);
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found."));

        if (seller.getApprovalStatus() != Seller.ApprovalStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller account is not approved.");
        }

        // Save image file
        String imagePath = null;
        if (image != null && !image.isEmpty()) {
            try {
                imagePath = fileStorageService.store(image, "products");
            } catch (IOException e) {
                return ApiResponse.error("Image upload failed. Please try again.");
            }
        }

        Product product = Product.builder()
                .name(name.trim())
                .description(description)
                .price(price)
                .discountPercent(discountPercent != null ? discountPercent : 0.0)
                .stock(stock)
                .category(category)
                .subcategory(subcategory)
                .sku(sku)
                .weight(weight)
                .size(size)
                .material(material)
                .color(color)
                .deliveryInfo(deliveryInfo)
                .returnPolicy(returnPolicy)
                .imagePath(imagePath)
                .sellerId(sellerId)
                .sellerName(seller.getShopName() != null ? seller.getShopName() : seller.getFullName())
                .isActive(true)
                .paymentStatus("PAID")
                .build();

        Product saved = productRepository.save(product);
        return ApiResponse.ok("Product added successfully.", toMap(saved), null);
    }

    // ── Get all active products (for customers) ───────────────────────────
    public ApiResponse getAllActiveProducts() {
        List<Product> products = productRepository.findByIsActiveTrue();
        List<Map<String, Object>> list = products.stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return ApiResponse.ok("Products fetched.", list, null);
    }

    // ── Get seller's own products ─────────────────────────────────────────
    public ApiResponse getSellerProducts(String token) {
        Long sellerId = extractSellerId(token);
        List<Product> products = productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        List<Map<String, Object>> list = products.stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return ApiResponse.ok("Seller products fetched.", list, null);
    }

    // ── Toggle product active/inactive ────────────────────────────────────
    public ApiResponse toggleProductActive(String token, Long productId) {
        Long sellerId = extractSellerId(token);
        Product product = findProductOwnedBySeller(productId, sellerId);
        product.setIsActive(!product.getIsActive());
        productRepository.save(product);
        return ApiResponse.ok("Product status updated.", toMap(product), null);
    }

    // ── Delete a product ──────────────────────────────────────────────────
    public ApiResponse deleteProduct(String token, Long productId) {
        Long sellerId = extractSellerId(token);
        Product product = findProductOwnedBySeller(productId, sellerId);
        productRepository.delete(product);
        return ApiResponse.ok("Product deleted.", null, null);
    }

    // ── Update a product ──────────────────────────────────────────────────
    public ApiResponse updateProduct(
            String token,
            Long productId,
            String name,
            String description,
            Double price,
            Double discountPercent,
            Integer stock,
            String category,
            String subcategory,
            String sku,
            String weight,
            String size,
            String material,
            String color,
            String deliveryInfo,
            String returnPolicy,
            MultipartFile image
    ) {
        Long sellerId = extractSellerId(token);
        Product product = findProductOwnedBySeller(productId, sellerId);

        if (name != null && !name.isBlank()) product.setName(name.trim());
        if (description != null) product.setDescription(description);
        if (price != null) product.setPrice(price);
        if (discountPercent != null) product.setDiscountPercent(discountPercent);
        if (stock != null) product.setStock(stock);
        if (category != null) product.setCategory(category);
        if (subcategory != null) product.setSubcategory(subcategory);
        if (sku != null) product.setSku(sku);
        if (weight != null) product.setWeight(weight);
        if (size != null) product.setSize(size);
        if (material != null) product.setMaterial(material);
        if (color != null) product.setColor(color);
        if (deliveryInfo != null) product.setDeliveryInfo(deliveryInfo);
        if (returnPolicy != null) product.setReturnPolicy(returnPolicy);

        if (image != null && !image.isEmpty()) {
            try {
                String imagePath = fileStorageService.store(image, "products");
                product.setImagePath(imagePath);
            } catch (IOException e) {
                return ApiResponse.error("Image upload failed.");
            }
        }

        productRepository.save(product);
        return ApiResponse.ok("Product updated.", toMap(product), null);
    }

    // ── Private helpers ───────────────────────────────────────────────────

    private Long extractSellerId(String bearerToken) {
        String token = bearerToken.replace("Bearer ", "").trim();
        String subject = jwtUtil.extractSubject(token);
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token.");
        }
    }

    private Product findProductOwnedBySeller(Long productId, Long sellerId) {
        Optional<Product> opt = productRepository.findById(productId);
        if (opt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found.");
        }
        Product product = opt.get();
        if (!product.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }
        return product;
    }

    private Map<String, Object> toMap(Product p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId().toString());
        map.put("name", p.getName());
        map.put("description", p.getDescription());
        map.put("price", p.getPrice());
        map.put("discount", p.getDiscountPercent());

        // Compute final price
        double finalPrice = p.getPrice() - (p.getPrice() * p.getDiscountPercent() / 100);
        map.put("finalPrice", Math.max(finalPrice, 0));

        map.put("stock", p.getStock());
        map.put("category", p.getCategory());
        map.put("subcategory", p.getSubcategory());
        map.put("sku", p.getSku());
        map.put("weight", p.getWeight());
        map.put("size", p.getSize());
        map.put("material", p.getMaterial());
        map.put("color", p.getColor());
        map.put("delivery", p.getDeliveryInfo());
        map.put("returnPolicy", p.getReturnPolicy());
        map.put("sellerId", p.getSellerId().toString());
        map.put("sellerName", p.getSellerName());
        map.put("active", p.getIsActive());
        map.put("visibleToCustomer", p.getIsActive());
        map.put("paymentStatus", p.getPaymentStatus());
        map.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        map.put("updatedAt", p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null);

        // Build image URL — served via /api/files endpoint
        if (p.getImagePath() != null) {
            map.put("image", "/api/files/" + p.getImagePath());
        } else {
            map.put("image", null);
        }

        return map;
    }
}
