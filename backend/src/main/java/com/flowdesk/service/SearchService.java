package com.flowdesk.service;

import com.flowdesk.dto.response.SearchResultDto;

public interface SearchService {
    SearchResultDto search(String q, int page, int limit);
}
