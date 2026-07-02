package com.flowdesk.service;

import com.flowdesk.dto.request.CheckoutRequest;

public interface BillingService {
    String createCheckoutSession(CheckoutRequest request);
    void handleWebhook(String payload, String sigHeader);
}
