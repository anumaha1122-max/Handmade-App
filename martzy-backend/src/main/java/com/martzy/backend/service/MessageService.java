package com.martzy.backend.service;

import com.martzy.backend.dto.MessageDTO;
import com.martzy.backend.model.Customer;
import com.martzy.backend.model.Message;
import com.martzy.backend.model.Order;
import com.martzy.backend.model.Seller;
import com.martzy.backend.repository.CustomerRepository;
import com.martzy.backend.repository.MessageRepository;
import com.martzy.backend.repository.OrderRepository;
import com.martzy.backend.repository.SellerRepository;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class MessageService {

    private final MessageRepository messageRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final JwtUtil jwtUtil;

    // ── Helpers ────────────────────────────────────────────────────────────
    private Long extractId(String bearerToken) {
        String token = bearerToken.replace("Bearer ", "").trim();
        String subject = jwtUtil.extractSubject(token);
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            Optional<Long> customerId = customerRepository.findByEmail(subject).map(Customer::getId);
            if (customerId.isPresent()) {
                return customerId.get();
            }
            return sellerRepository.findByEmail(subject)
                    .map(Seller::getId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token."));
        }
    }

    // ── Customer: Send a Message ──────────────────────────────────────────
    public ApiResponse customerSend(String token, MessageDTO dto) {
        Long customerId = extractId(token);

        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getCustomerId().equals(customerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This order does not belong to you.");
        }

        if (dto.getContent() == null || dto.getContent().isBlank()) {
            return ApiResponse.error("Message content cannot be empty.");
        }

        Message msg = Message.builder()
                .orderId(dto.getOrderId())
                .senderId(customerId)
                .senderType("CUSTOMER")
                .content(dto.getContent().trim())
                .isRead(false)
                .build();

        Message saved = messageRepository.save(msg);
        return ApiResponse.ok("Message sent.", saved, null);
    }

    // ── Seller: Send a Message ────────────────────────────────────────────
    public ApiResponse sellerSend(String token, MessageDTO dto) {
        Long sellerId = extractId(token);

        if (dto.getContent() == null || dto.getContent().isBlank()) {
            return ApiResponse.error("Message content cannot be empty.");
        }

        // Verify order exists
        orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        Message msg = Message.builder()
                .orderId(dto.getOrderId())
                .senderId(sellerId)
                .senderType("SELLER")
                .content(dto.getContent().trim())
                .isRead(false)
                .build();

        Message saved = messageRepository.save(msg);
        return ApiResponse.ok("Message sent.", saved, null);
    }

    // ── Customer: Get Thread for an Order ────────────────────────────────
    public ApiResponse customerGetThread(String token, Long orderId) {
        Long customerId = extractId(token);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        if (!order.getCustomerId().equals(customerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This order does not belong to you.");
        }

        // Mark seller's messages as read for this customer
        messageRepository.markThreadRead(orderId, "CUSTOMER");

        List<Message> thread = messageRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        return ApiResponse.ok("Thread fetched.", thread, null);
    }

    // ── Seller: Get Thread for an Order ──────────────────────────────────
    public ApiResponse sellerGetThread(String token, Long orderId) {
        extractId(token); // just verify token

        // Mark customer's messages as read for this seller
        messageRepository.markThreadRead(orderId, "SELLER");

        List<Message> thread = messageRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        return ApiResponse.ok("Thread fetched.", thread, null);
    }

    // ── Unread count (for badge) ──────────────────────────────────────────
    public ApiResponse unreadCount(String token, Long orderId, String callerType) {
        extractId(token);
        long count = messageRepository.countByOrderIdAndIsReadFalseAndSenderTypeNot(orderId, callerType);
        return ApiResponse.ok("Unread count fetched.", count, null);
    }
}
