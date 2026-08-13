package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private String id;
    private String email;
    private String name;
    private String firstName;
    private String lastName;
    private String jobTitle;
    private String phone;
    private String location;
    private String role;
    private String dept;
    private String avatar;
    private String organization;
}
