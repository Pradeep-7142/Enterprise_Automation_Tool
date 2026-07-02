package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDto {
    private Integer id;
    private String name;
    private String head;
    private Integer members;
    private Integer requests;
    private String budget;
    private Integer performance;
    private String color;
}
