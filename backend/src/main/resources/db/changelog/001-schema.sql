-- FlowDesk initial schema

CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    logo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE departments (
    id UUID PRIMARY KEY,
    display_id INT UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    head_user_id UUID,
    members INT NOT NULL DEFAULT 0,
    request_count INT NOT NULL DEFAULT 0,
    budget VARCHAR(50),
    performance INT DEFAULT 0,
    color VARCHAR(20),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    display_id INT UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(255),
    role_id UUID REFERENCES roles(id),
    department_id UUID REFERENCES departments(id),
    phone VARCHAR(50),
    location VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    manager_id UUID REFERENCES users(id),
    join_date DATE,
    avatar VARCHAR(10),
    direct_reports INT NOT NULL DEFAULT 0,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

ALTER TABLE departments ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_user_id) REFERENCES users(id);

CREATE TABLE user_skills (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    skill VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE otp_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE workflow_requests (
    id UUID PRIMARY KEY,
    request_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    department_id UUID REFERENCES departments(id),
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    assignee_id UUID REFERENCES users(id),
    current_step VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    requester_id UUID REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE request_comments (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES workflow_requests(id),
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES request_comments(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE file_metadata (
    id UUID PRIMARY KEY,
    display_id INT UNIQUE,
    name VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL,
    size_label VARCHAR(50),
    size_bytes BIGINT,
    storage_key VARCHAR(500),
    content_type VARCHAR(100),
    parent_id UUID REFERENCES file_metadata(id),
    item_count INT,
    shared BOOLEAN NOT NULL DEFAULT FALSE,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE request_attachments (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES workflow_requests(id),
    file_id UUID NOT NULL REFERENCES file_metadata(id),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE approval_steps (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL REFERENCES workflow_requests(id),
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    approver_id UUID REFERENCES users(id),
    step_order INT NOT NULL,
    acted_at TIMESTAMP,
    comment TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    template_version INT NOT NULL DEFAULT 1,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE workflow_nodes (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES workflow_templates(id),
    label VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL,
    pos_x DOUBLE PRECISION,
    pos_y DOUBLE PRECISION,
    config TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE workflow_edges (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES workflow_templates(id),
    source_node_id UUID NOT NULL REFERENCES workflow_nodes(id),
    target_node_id UUID NOT NULL REFERENCES workflow_nodes(id),
    label VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    display_id INT UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(30) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    priority VARCHAR(20) NOT NULL,
    resource_ref VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    display_id INT UNIQUE,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    ip_address VARCHAR(50),
    type VARCHAR(30) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    display_id INT UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    last_message TEXT,
    avatar VARCHAR(10),
    member_count INT,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE messages (
    id UUID PRIMARY KEY,
    display_id INT UNIQUE,
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    sender_id UUID REFERENCES users(id),
    text TEXT NOT NULL,
    from_side VARCHAR(10) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    sender_label VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    unread_count INT NOT NULL DEFAULT 0,
    online BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE TABLE reports (
    id UUID PRIMARY KEY,
    display_id INT UNIQUE,
    title VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    schedule_cron VARCHAR(100),
    last_generated_at TIMESTAMP,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_requests_number ON workflow_requests(request_number);
CREATE INDEX idx_requests_org_status ON workflow_requests(organization_id, status);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_audit_org ON audit_logs(organization_id, occurred_at);
