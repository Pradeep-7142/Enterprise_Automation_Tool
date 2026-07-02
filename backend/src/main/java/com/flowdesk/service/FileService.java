package com.flowdesk.service;

import com.flowdesk.dto.response.FileDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface FileService {
    List<FileDto> listAll();
    FileDto getByDisplayId(Integer displayId);
    FileDto upload(MultipartFile file, Integer parentId);
    void delete(Integer displayId);
}
