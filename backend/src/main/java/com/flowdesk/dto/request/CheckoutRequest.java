package com.flowdesk.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotBlank
    private String tier; // e.g., "growth" or "enterprise"
    
    @NotBlank
    private String successUrl;
    
    @NotBlank
    private String cancelUrl;
}
