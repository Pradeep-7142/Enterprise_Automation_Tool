package com.flowdesk.service;

import java.util.Map;

public interface AdminService {
    Map<String, Object> getStats();
    Map<String, Object> getSystemHealth();
}
