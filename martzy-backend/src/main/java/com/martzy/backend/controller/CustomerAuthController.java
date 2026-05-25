// ─── src/main/java/com/martzy/backend/controller/CustomerAuthController.java ─
package com.martzy.backend.controller;

import com.martzy.backend.dto.CustomerRegisterDTO;
import com.martzy.backend.dto.LoginDTO;
import com.martzy.backend.response.ApiResponse;
import com.martzy.backend.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")   // allow all origins for mobile app
public class CustomerAuthController {

    private final CustomerService customerService;

    // POST /api/customer/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(
            @Valid @RequestBody CustomerRegisterDTO dto
    ) {
        ApiResponse response = customerService.register(dto);
        int status = response.isSuccess() ? 201 : 400;
        return ResponseEntity.status(status).body(response);
    }

    // POST /api/customer/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
            @Valid @RequestBody LoginDTO dto
    ) {
        ApiResponse response = customerService.login(dto);
        int status = response.isSuccess() ? 200 : 401;
        return ResponseEntity.status(status).body(response);
    }
}