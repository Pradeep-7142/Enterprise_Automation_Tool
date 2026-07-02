package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {
    private Integer id;
    private String name;
    private String role;
    private String dept;
    private String email;
    private String phone;
    private String location;
    private String status;
    private String manager;
    private List<String> skills;
    private String joinDate;
    private String avatar;
    private Integer reports;
}
