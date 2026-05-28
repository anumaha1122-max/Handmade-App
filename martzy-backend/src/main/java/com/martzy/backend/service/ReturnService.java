package com.martzy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.martzy.backend.dto.ReturnRequestDTO;
import com.martzy.backend.dto.ReturnRespondDTO;
import com.martzy.backend.model.Customer;
import com.martzy.backend.model.Order;
import com.martzy.backend.model.ReturnRequest;
import com.martzy.backend.model.Seller;
import com.martzy.backend.repository.CustomerRepository;
import com.martzy.backend.repository.OrderRepository;
import com.martzy.backend.repository.ReturnRequestRepository;
import com.martzy.backend.repository.SellerRepository;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor

public class ReturnService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Helpers ────────────────────────────────────────────────────────────
    private Long extractCustomerId(String bearerToken) {
        String token = bearerToken.replace("Bearer ", "").trim();
        String subject = jwtUtil.extractSubject(token);
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            return customerRepository.findByEmail(subject)
                    .map(Customer::getId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid customer token."));
        }
    }

    private Long extractSellerId(String bearerToken) {
        String token = bearerToken.replace("Bearer ", "").trim();
        String subject = jwtUtil.extractSubject(token);
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            return sellerRepository.findByEmail(subject)
                    .map(Seller::getId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid seller token."));
        }
    }

    /** Find the first sellerId among the order's items for this return. */
    private Long resolveSellerIdFromOrder(Order order) {
        try {
            List<Map<String, Object>> items = objectMapper.readValue(
                    order.getItemsJson(), new TypeReference<List<Map<String, Object>>>() {});
            if (!items.isEmpty() && items.get(0).get("sellerId") != null) {
                return Long.parseLong(items.get(0).get("sellerId").toString());
            }
        } catch (Exception ignored) {}
        return 0L;
    }

    // ── Customer: Request a Return ─────────────────────────────────────────
    public ApiResponse requestReturn(String token, ReturnRequestDTO dto) {
        Long customerId = extractCustomerId(token);

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getCustomerId().equals(customerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This order does not belong to you.");
        }

        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            return ApiResponse.error("Return can only be requested after the order is delivered.");
        }

        if (returnRequestRepository.existsByOrderIdAndCustomerId(dto.getOrderId(), customerId)) {
            return ApiResponse.error("A return request for this order already exists.");
        }

        Long sellerId = resolveSellerIdFromOrder(order);

        ReturnRequest rr = ReturnRequest.builder()
                .orderId(dto.getOrderId())
                .customerId(customerId)
                .sellerId(sellerId)
                .reason(dto.getReason())
                .description(dto.getDescription())
                .status("REQUESTED")
                .build();

        ReturnRequest saved = returnRequestRepository.save(rr);
        return ApiResponse.ok("Return request submitted successfully.", saved, null);
    }

    // ── Customer: My Return Requests ───────────────────────────────────────
    public ApiResponse getMyReturns(String token) {
        Long customerId = extractCustomerId(token);
        List<ReturnRequest> list = returnRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return ApiResponse.ok("Return requests fetched.", list, null);
    }

    // ── Customer / Seller: Get single return ───────────────────────────────
    public ApiResponse getReturn(Long id) {
        ReturnRequest rr = returnRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Return request not found."));
        return ApiResponse.ok("Return request fetched.", rr, null);
    }

    // ── Seller: View Returns for Their Orders ──────────────────────────────
    public ApiResponse getSellerReturns(String token) {
        Long sellerId = extractSellerId(token);
        List<ReturnRequest> list = returnRequestRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        return ApiResponse.ok("Seller return requests fetched.", list, null);
    }

    // ── Seller: Approve or Reject ──────────────────────────────────────────
    public ApiResponse respondToReturn(String token, Long returnId, ReturnRespondDTO dto) {
        Long sellerId = extractSellerId(token);

        ReturnRequest rr = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Return request not found."));

        if (!rr.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This return does not belong to your shop.");
        }

        if (!"REQUESTED".equalsIgnoreCase(rr.getStatus())) {
            return ApiResponse.error("This return has already been responded to.");
        }

        String newStatus = dto.getStatus().toUpperCase();
        if (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED")) {
            return ApiResponse.error("Status must be APPROVED or REJECTED.");
        }

        rr.setStatus(newStatus);
        rr.setSellerNote(dto.getSellerNote());
        if (dto.getRefundAmount() != null) {
            rr.setRefundAmount(dto.getRefundAmount());
        }

        returnRequestRepository.save(rr);
        return ApiResponse.ok("Return request " + newStatus.toLowerCase() + ".", rr, null);
    }

    // ── Seller: Advance status (PICKED_UP → REFUND_INITIATED → REFUNDED) ──
    public ApiResponse advanceReturnStatus(String token, Long returnId, String newStatus) {
        Long sellerId = extractSellerId(token);

        ReturnRequest rr = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Return request not found."));

        if (!rr.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This return does not belong to your shop.");
        }

        List<String> allowed = List.of("PICKED_UP", "REFUND_INITIATED", "REFUNDED");
        if (!allowed.contains(newStatus.toUpperCase())) {
            return ApiResponse.error("Invalid status. Allowed: PICKED_UP, REFUND_INITIATED, REFUNDED.");
        }

        rr.setStatus(newStatus.toUpperCase());
        returnRequestRepository.save(rr);
        return ApiResponse.ok("Return status updated to " + newStatus + ".", rr, null);
    }
}
