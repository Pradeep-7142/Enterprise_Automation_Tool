package com.flowdesk.service.impl;

import com.flowdesk.config.FlowDeskProperties;
import com.flowdesk.constant.Enums;
import com.flowdesk.dto.response.FileDto;
import com.flowdesk.entity.FileMetadata;
import com.flowdesk.entity.User;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.exception.ResourceNotFoundException;
import com.flowdesk.mapper.FileMapper;
import com.flowdesk.repository.FileMetadataRepository;
import com.flowdesk.service.FileService;
import com.flowdesk.util.SecurityUtils;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FileServiceImpl implements FileService {
    private final FileMetadataRepository fileMetadataRepository;
    private final FileMapper fileMapper;
    private final MinioClient minioClient;
    private final FlowDeskProperties properties;

    public FileServiceImpl(FileMetadataRepository fileMetadataRepository, FileMapper fileMapper,
                           MinioClient minioClient, FlowDeskProperties properties) {
        this.fileMetadataRepository = fileMetadataRepository;
        this.fileMapper = fileMapper;
        this.minioClient = minioClient;
        this.properties = properties;
    }

    @Override
    public List<FileDto> listAll() {
        return fileMapper.toDtoList(fileMetadataRepository.findByOrganizationIdAndDeletedFalseOrderByNameAsc(requireUser().getOrganization().getId()));
    }

    @Override
    public FileDto getByDisplayId(Integer displayId) {
        return fileMapper.toDto(fileMetadataRepository.findByDisplayIdAndDeletedFalse(displayId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found")));
    }

    @Override
    @Transactional
    public FileDto upload(MultipartFile file, Integer parentId) {
        User user = requireUser();
        try {
            String key = UUID.randomUUID() + "-" + file.getOriginalFilename();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(properties.getMinio().getBucket())
                    .object(key)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
            FileMetadata meta = new FileMetadata();
            meta.setName(file.getOriginalFilename());
            meta.setType(guessType(file.getOriginalFilename()));
            meta.setSizeBytes(file.getSize());
            meta.setSizeLabel(formatSize(file.getSize()));
            meta.setStorageKey(key);
            meta.setContentType(file.getContentType());
            meta.setOrganization(user.getOrganization());
            meta.setUploadedBy(user);
            if (parentId != null) {
                fileMetadataRepository.findByDisplayIdAndDeletedFalse(parentId).ifPresent(meta::setParent);
            }
            return fileMapper.toDto(fileMetadataRepository.save(meta));
        } catch (Exception e) {
            throw new BusinessException("File upload failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public void delete(Integer displayId) {
        FileMetadata file = fileMetadataRepository.findByDisplayIdAndDeletedFalse(displayId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found"));
        file.setDeleted(true);
        fileMetadataRepository.save(file);
    }

    private Enums.FileType guessType(String name) {
        if (name == null) return Enums.FileType.doc;
        String lower = name.toLowerCase();
        if (lower.endsWith(".pdf")) return Enums.FileType.pdf;
        if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return Enums.FileType.xlsx;
        if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return Enums.FileType.image;
        return Enums.FileType.doc;
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.0f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024));
    }

    private User requireUser() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        return user;
    }
}
