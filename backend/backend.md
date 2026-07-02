# Enterprise Workflow Automation Platform – Complete Spring Boot Backend Architecture Prompt

You are a Senior Java Backend Architect with extensive experience building enterprise SaaS applications.

Your task is to build the complete backend for an Enterprise Workflow Automation Platform using modern Java and Spring Boot best practices.

The frontend React project is already available in the workspace. Study its API requirements, pages, and expected user interactions before implementing backend APIs. Design REST endpoints that naturally support the frontend while following enterprise standards.

This is NOT a CRUD demo project.

It should resemble the backend architecture used in companies like ServiceNow, Atlassian, Salesforce, Oracle, Microsoft, Adobe, and PayPal.

The code should be modular, scalable, testable, production-ready, and follow clean architecture.

---

# Technology Stack

Java 21

Spring Boot 3.x

Spring Security

Spring Data JPA

Hibernate

PostgreSQL

Redis

JWT Authentication

Refresh Tokens

Docker

Docker Compose

Liquibase (preferred) or Flyway

Swagger / OpenAPI

MapStruct

Lombok

Maven

JUnit 5

Mockito

Spring Validation

SLF4J Logging

Spring Mail

Spring Scheduler

WebSocket

Spring Cache

Spring Actuator

Micrometer

Prometheus

Grafana

Optional modules

Kafka

RabbitMQ

ElasticSearch

AWS S3 / MinIO

---

# Architecture

Follow Clean Architecture.

Controller

↓

Service

↓

Repository

↓

Database

Separate

DTO

Entity

Mapper

Validation

Exception

Security

Configuration

Scheduler

Utility

Constants

Events

Listeners

Cache

WebSocket

Notification

Email

Audit

Files

Workflow

Reports

Analytics

---

# Project Structure

src/main/java

config

security

controller

service

service/impl

repository

entity

dto/request

dto/response

mapper

exception

validation

util

constant

event

listener

cache

notification

workflow

audit

scheduler

websocket

email

report

analytics

file

auth

role

permission

department

employee

request

approval

comment

attachment

search

integration

common

---

# Authentication Module

Implement

User Registration

Login

Logout

Refresh Token

Access Token

Password Reset

Forgot Password

Email Verification

OTP Verification

Change Password

Update Password

Session Management

Remember Me

Token Revocation

Refresh Token Rotation

Role Based Access Control

Permission Based Authorization

Method Level Security

Google OAuth placeholder

---

# Roles

Super Admin

Organization Admin

Department Head

Manager

Employee

Finance

HR

IT

Auditor

Viewer

Support

Every endpoint must enforce authorization.

---

# User Module

CRUD

Profile

Profile Picture

Skills

Department

Manager

Status

Organization

Availability

Search

Pagination

Filtering

Sorting

---

# Organization Module

Organizations

Departments

Teams

Reporting Structure

Hierarchy

Organization Settings

---

# Workflow Engine

This is the core module.

Support

Workflow Templates

Workflow Versioning

Workflow Status

Workflow Definition

Workflow Execution

Approval Nodes

Conditional Nodes

Delay Nodes

Notification Nodes

Task Nodes

API Nodes

Parallel Approval

Sequential Approval

Escalation Rules

Delegation

Approval History

Workflow Timeline

Workflow Logs

Rollback Support

---

# Request Module

Create Request

Update

Delete

Cancel

Submit

Approve

Reject

Escalate

Delegate

Reassign

Track Progress

Timeline

History

Attachments

Comments

Custom Fields

Priority

Category

Tags

Search

Filters

Export

---

# Approval Module

Approve

Reject

Send Back

Delegate

Escalate

Forward

Bulk Approval

Approval SLA

Approval Metrics

Approval History

---

# Comments

Threaded Comments

Mentions

Replies

Edit

Delete

History

---

# Notifications

Real Time Notifications

WebSocket

Email

In-App

Push Notification Interface

Notification Preferences

Unread Count

Read Status

Broadcast Notifications

---

# Messaging

Private Chat

Group Chat

Typing Indicator

Read Receipts

Attachments

Online Users

WebSocket

---

# Audit Logs

Every important action should create an audit record.

Store

User

Action

Old Value

New Value

Timestamp

IPAddress

Device

Entity

Module

---

# Files

Upload

Download

Delete

Preview

Versioning

Folder Support

Storage Quota

Use MinIO locally.

Support future migration to AWS S3.

---

# Search

Global Search

Employees

Requests

Files

Comments

Departments

Workflow Templates

Support pagination.

---

# Reports

Generate

CSV

Excel

PDF

Background generation

Scheduled reports

---

# Analytics

Dashboard statistics

Department metrics

Approval metrics

Pending requests

Completed requests

Average approval time

Daily trends

Monthly trends

Heatmaps

Leaderboards

---

# Scheduler

Daily Reports

Reminder Emails

Pending Approval Reminder

Inactive User Detection

Workflow Timeout

Archive Old Logs

Cleanup Expired Tokens

---

# Cache

Redis

Cache

Users

Departments

Workflow Templates

Reports

Dashboard Statistics

Search Results

Implement cache eviction.

---

# Logging

Structured Logging

Correlation IDs

Request IDs

Execution Time Logging

Global Request Logging

---

# Exception Handling

Global Exception Handler

Custom Exceptions

Business Exceptions

Validation Errors

Unauthorized

Forbidden

Not Found

Conflict

---

# Validation

Bean Validation

Custom Validators

Reusable validation annotations

---

# API Standards

RESTful APIs

Versioned APIs

/api/v1/

Consistent Response Wrapper

Pagination

Filtering

Sorting

Search

HTTP Status Codes

Error Codes

Swagger Documentation

---

# Database

Design a normalized PostgreSQL schema.

Create proper relationships.

Use UUID primary keys.

Use optimistic locking where required.

Soft delete where appropriate.

Add indexes.

Maintain audit fields.

created_at

updated_at

created_by

updated_by

deleted

version

---

# Design Patterns

Use appropriate patterns where applicable.

Builder

Strategy

Factory

Observer

Chain of Responsibility

Template Method

Command

Specification

State

Decorator

Adapter

---

# Security

Spring Security

JWT

Refresh Tokens

Password Encryption

BCrypt

CORS

Rate Limiting

CSRF configuration

Input Validation

SQL Injection Prevention

XSS Protection

Security Headers

---

# Testing

JUnit 5

Mockito

Integration Tests

Repository Tests

Controller Tests

Service Tests

Test Containers if possible

Target at least 80% coverage.

---

# Docker

Dockerfile

Docker Compose

PostgreSQL

Redis

MinIO

Prometheus

Grafana

Application Container

Everything should run using

docker compose up

---

# Monitoring

Spring Boot Actuator

Micrometer

Prometheus

Grafana

Health Checks

Metrics

---

# Documentation

Swagger UI

README

Setup Guide

Architecture Diagram (Markdown)

API Documentation

ER Diagram (Markdown)

Sequence Diagrams (Markdown)

---

# Code Quality

Follow SOLID principles.

Follow DRY.

Follow KISS.

Avoid duplicated code.

Use constructor injection only.

Never use field injection.

Use DTOs everywhere.

Never expose entities directly.

Use MapStruct.

Use meaningful package names.

Use proper JavaDocs.

Use meaningful commit-friendly structure.

---

# Development Strategy

Do NOT generate the entire backend in one response.

Instead, build the project incrementally.

Start by generating:

1. Complete project structure
2. pom.xml
3. application.yml
4. Docker setup
5. Security configuration
6. Database configuration
7. Authentication module
8. User module

After each module is completed, continue with the next while maintaining compatibility with previously generated code.

Always ensure the generated backend remains synchronized with the React frontend already present in the workspace. Reuse frontend API contracts where appropriate and keep the code production-ready, scalable, and suitable for a real enterprise deployment.
