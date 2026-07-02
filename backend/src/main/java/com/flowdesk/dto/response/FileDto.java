package com.flowdesk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileDto {
    private Integer id;
    private String name;
    private String type;
    private String size;
    private String modified;
    private Integer items;
    private Boolean shared;
}
