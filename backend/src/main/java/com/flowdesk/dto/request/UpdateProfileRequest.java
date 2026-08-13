package com.flowdesk.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String jobTitle;
    private String phone;
    private String location;
    private String avatar;
}
