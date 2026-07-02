ALTER TABLE organizations RENAME COLUMN stripe_customer_id TO razorpay_customer_id;
ALTER TABLE organizations RENAME COLUMN stripe_subscription_id TO razorpay_subscription_id;
