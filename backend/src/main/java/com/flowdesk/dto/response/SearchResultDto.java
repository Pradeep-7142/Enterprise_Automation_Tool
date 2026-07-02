package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {
    private List<Map<String, Object>> employees;
    private List<RequestDto> requests;
    private List<FileDto> files;
    private List<DepartmentDto> departments;
    private long total;
}
