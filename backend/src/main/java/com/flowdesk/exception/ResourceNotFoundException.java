package com.flowdesk.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String resource) {
        super(resource + " not found", HttpStatus.NOT_FOUND, "NOT_FOUND");
    }
}
