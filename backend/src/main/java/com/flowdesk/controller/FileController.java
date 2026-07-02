package com.flowdesk.controller;

import com.flowdesk.dto.response.ApiResponse;
import com.flowdesk.dto.response.FileDto;
import com.flowdesk.security.Permissions;
import com.flowdesk.service.FileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {
    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FileDto>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(fileService.listAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FileDto>> get(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(fileService.getByDisplayId(id)));
    }

    @PostMapping("/upload")
    @PreAuthorize(Permissions.CONTRIBUTOR)
    public ResponseEntity<ApiResponse<FileDto>> upload(@RequestParam("file") MultipartFile file,
                                                       @RequestParam(required = false) Integer parentId) {
        return ResponseEntity.ok(ApiResponse.ok(fileService.upload(file, parentId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(Permissions.FILE_REMOVER)
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        fileService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("File deleted", null));
    }
}
