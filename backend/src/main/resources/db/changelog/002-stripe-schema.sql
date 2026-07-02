ALTER TABLE organizations ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE organizations ADD COLUMN stripe_subscription_id VARCHAR(255);
ALTER TABLE organizations ADD COLUMN subscription_status VARCHAR(50);
ALTER TABLE organizations ADD COLUMN subscription_tier VARCHAR(50);
