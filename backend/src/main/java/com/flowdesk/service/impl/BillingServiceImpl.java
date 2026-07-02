package com.flowdesk.service.impl;

import com.flowdesk.dto.request.CheckoutRequest;
import com.flowdesk.entity.Organization;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.repository.OrganizationRepository;
import com.flowdesk.service.BillingService;
import com.flowdesk.util.SecurityUtils;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Subscription;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
public class BillingServiceImpl implements BillingService {

    @Value("${flowdesk.razorpay.key-id}")
    private String keyId;

    @Value("${flowdesk.razorpay.key-secret}")
    private String keySecret;

    @Value("${flowdesk.razorpay.webhook-secret}")
    private String webhookSecret;

    @Value("${flowdesk.razorpay.plan-growth}")
    private String planGrowth;

    @Value("${flowdesk.razorpay.plan-enterprise}")
    private String planEnterprise;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            this.razorpayClient = new RazorpayClient(this.keyId, this.keySecret);
        } catch (RazorpayException e) {
            log.error("Failed to initialize RazorpayClient", e);
            throw new RuntimeException(e);
        }
    }

    private final OrganizationRepository organizationRepository;

    public BillingServiceImpl(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Override
    @Transactional
    public String createCheckoutSession(CheckoutRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        }
        Organization org = currentUser.getOrganization();
        if (org == null) {
            throw new BusinessException("User does not belong to any organization", HttpStatus.BAD_REQUEST);
        }

        String planId;
        String tier = request.getTier().toLowerCase();
        if ("growth".equals(tier)) {
            planId = planGrowth;
        } else if ("enterprise".equals(tier)) {
            planId = planEnterprise;
        } else {
            throw new BusinessException("Invalid subscription tier: " + tier, HttpStatus.BAD_REQUEST);
        }

        // Return mock checkout URL if keys are not set up to prevent crash in mock environments
        if (keyId == null || keyId.contains("mock") || keySecret == null || keySecret.contains("mock")) {
            log.info("Mock Razorpay environment detected. Returning mock checkout URL.");
            return "https://api.razorpay.com/v1/checkout/mock_sub_" + UUID.randomUUID().toString().substring(0, 8);
        }

        try {
            JSONObject subscriptionRequest = new JSONObject();
            subscriptionRequest.put("plan_id", planId);
            subscriptionRequest.put("total_count", 120); // 10 years monthly cycles
            subscriptionRequest.put("customer_notify", 1);

            JSONObject notes = new JSONObject();
            notes.put("organizationId", org.getId().toString());
            notes.put("tier", tier);
            subscriptionRequest.put("notes", notes);

            Subscription subscription = razorpayClient.subscriptions.create(subscriptionRequest);
            return subscription.get("short_url");
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay subscription", e);
            throw new BusinessException("Billing system error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        try {
            if ("whsec_mock".equals(webhookSecret)) {
                log.info("Razorpay webhook signature verification bypassed (mock profile)");
            } else {
                boolean isValid = Utils.verifyWebhookSignature(payload, sigHeader, webhookSecret);
                if (!isValid) {
                    log.error("Razorpay signature verification failed");
                    throw new BusinessException("Invalid signature", HttpStatus.BAD_REQUEST);
                }
            }
        } catch (RazorpayException e) {
            log.error("Razorpay signature verification exception", e);
            throw new BusinessException("Invalid signature", HttpStatus.BAD_REQUEST);
        }

        JSONObject json = new JSONObject(payload);
        String event = json.optString("event");
        log.info("Received Razorpay webhook event: {}", event);

        JSONObject payloadObj = json.optJSONObject("payload");
        if (payloadObj == null) {
            log.warn("Razorpay webhook payload is empty");
            return;
        }

        JSONObject subObj = payloadObj.optJSONObject("subscription");
        if (subObj == null) {
            log.info("Event payload does not contain subscription entity, skipping");
            return;
        }

        JSONObject entityObj = subObj.optJSONObject("entity");
        if (entityObj == null) {
            log.warn("Subscription entity is missing");
            return;
        }

        String status = entityObj.optString("status");
        String subscriptionId = entityObj.optString("id");
        String customerId = entityObj.optString("customer_id");
        JSONObject notes = entityObj.optJSONObject("notes");
        String orgIdStr = notes != null ? notes.optString("organizationId") : null;
        String tier = notes != null ? notes.optString("tier") : null;

        switch (event) {
            case "subscription.activated":
            case "subscription.charged":
                handleSubscriptionActivated(subscriptionId, customerId, orgIdStr, tier, status);
                break;
            case "subscription.pending":
            case "subscription.halted":
            case "subscription.cancelled":
            case "subscription.completed":
            case "subscription.updated":
                handleSubscriptionUpdated(subscriptionId, status);
                break;
            default:
                log.info("Unhandled Razorpay event type: {}", event);
                break;
        }
    }

    private void handleSubscriptionActivated(String subscriptionId, String customerId, String orgIdStr, String tier, String status) {
        Organization org = null;
        if (orgIdStr != null) {
            try {
                UUID orgId = UUID.fromString(orgIdStr);
                org = organizationRepository.findById(orgId).orElse(null);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid organization UUID in notes: {}", orgIdStr);
            }
        }

        if (org == null) {
            org = organizationRepository.findByRazorpaySubscriptionId(subscriptionId).orElse(null);
        }

        if (org == null) {
            log.warn("No organization found for subscription activation: id={}, orgId={}", subscriptionId, orgIdStr);
            return;
        }

        org.setRazorpayCustomerId(customerId);
        org.setRazorpaySubscriptionId(subscriptionId);
        org.setSubscriptionStatus(status != null ? status : "active");
        org.setSubscriptionTier(tier != null ? tier : "growth");
        organizationRepository.save(org);
        log.info("Organization {} successfully upgraded to tier {} via Razorpay subscription", org.getName(), org.getSubscriptionTier());
    }

    private void handleSubscriptionUpdated(String subscriptionId, String status) {
        Organization org = organizationRepository.findByRazorpaySubscriptionId(subscriptionId).orElse(null);
        if (org == null) {
            log.warn("No organization found for subscription ID {}", subscriptionId);
            return;
        }

        org.setSubscriptionStatus(status);
        organizationRepository.save(org);
        log.info("Organization {} subscription status updated to {}", org.getName(), status);
    }
}
