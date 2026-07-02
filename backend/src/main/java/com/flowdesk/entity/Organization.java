package com.flowdesk.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "organizations")
public class Organization extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(length = 500)
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "razorpay_customer_id")
    private String razorpayCustomerId;

    @Column(name = "razorpay_subscription_id")
    private String razorpaySubscriptionId;

    @Column(name = "subscription_status")
    private String subscriptionStatus;

    @Column(name = "subscription_tier")
    private String subscriptionTier;
}

