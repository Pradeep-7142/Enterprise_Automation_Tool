package com.flowdesk.controller;

import com.flowdesk.dto.request.CheckoutRequest;
import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.service.BillingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<String>> checkout(@Valid @RequestBody CheckoutRequest request) {
        String sessionUrl = billingService.createCheckoutSession(request);
        return ResponseEntity.ok(ApiResponse.ok("Session created", sessionUrl));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String sigHeader) {
        billingService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}
