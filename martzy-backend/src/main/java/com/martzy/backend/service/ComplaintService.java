package com.martzy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.martzy.backend.dto.ComplaintDTO;
import com.martzy.backend.dto.ComplaintRespondDTO;
import com.martzy.backend.model.Complaint;
import com.martzy.backend.model.Customer;
import com.martzy.backend.model.Order;
import com.martzy.backend.model.Seller;
import com.martzy.backend.repository.ComplaintRepository;
import com.martzy.backend.repository.CustomerRepository;
import com.martzy.backend.repository.OrderRepository;
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

public class ComplaintService {

    private final ComplaintRepository complaintRepository;
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

    // ── Customer: Raise a Complaint ────────────────────────────────────────
    public ApiResponse raiseComplaint(String token, ComplaintDTO dto) {
        Long customerId = extractCustomerId(token);

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getCustomerId().equals(customerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This order does not belong to you.");
        }

        Long sellerId = resolveSellerIdFromOrder(order);

        Complaint complaint = Complaint.builder()
                .orderId(dto.getOrderId())
                .customerId(customerId)
                .sellerId(sellerId)
                .subject(dto.getSubject())
                .description(dto.getDescription())
                .status("OPEN")
                .build();

        Complaint saved = complaintRepository.save(complaint);
        return ApiResponse.ok("Complaint raised successfully.", saved, null);
    }

    // ── Customer: My Complaints ────────────────────────────────────────────
    public ApiResponse getMyComplaints(String token) {
        Long customerId = extractCustomerId(token);
        List<Complaint> list = complaintRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        return ApiResponse.ok("Complaints fetched.", list, null);
    }

    // ── Seller: Complaints Against Their Shop ─────────────────────────────
    public ApiResponse getSellerComplaints(String token) {
        Long sellerId = extractSellerId(token);
        List<Complaint> list = complaintRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        return ApiResponse.ok("Seller complaints fetched.", list, null);
    }

    // ── Seller: Respond to a Complaint ────────────────────────────────────
    public ApiResponse sellerRespond(String token, Long complaintId, ComplaintRespondDTO dto) {
        Long sellerId = extractSellerId(token);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found."));

        if (!complaint.getSellerId().equals(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This complaint is not related to your shop.");
        }

        if ("RESOLVED".equalsIgnoreCase(complaint.getStatus()) || "CLOSED".equalsIgnoreCase(complaint.getStatus())) {
            return ApiResponse.error("This complaint has already been closed.");
        }

        complaint.setSellerResponse(dto.getSellerResponse());
        complaint.setStatus("IN_PROGRESS");
        complaintRepository.save(complaint);
        return ApiResponse.ok("Response submitted. Complaint is now IN_PROGRESS.", complaint, null);
    }

    // ── Admin: All Complaints ──────────────────────────────────────────────
    public ApiResponse getAllComplaints() {
        List<Complaint> list = complaintRepository.findAllByOrderByCreatedAtDesc();
        return ApiResponse.ok("All complaints fetched.", list, null);
    }

    // ── Admin: Resolve or Close a Complaint ───────────────────────────────
    public ApiResponse adminResolve(Long complaintId, ComplaintRespondDTO dto) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found."));

        List<String> allowed = List.of("RESOLVED", "CLOSED");
        if (dto.getStatus() == null || !allowed.contains(dto.getStatus().toUpperCase())) {
            return ApiResponse.error("Status must be RESOLVED or CLOSED.");
        }

        complaint.setStatus(dto.getStatus().toUpperCase());
        if (dto.getAdminNote() != null) {
            complaint.setAdminNote(dto.getAdminNote());
        }
        complaintRepository.save(complaint);
        return ApiResponse.ok("Complaint " + dto.getStatus().toLowerCase() + " successfully.", complaint, null);
    }
}
