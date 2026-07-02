package com.flowdesk.config;

import io.minio.MinioClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {
    private final FlowDeskProperties properties;

    public MinioConfig(FlowDeskProperties properties) {
        this.properties = properties;
    }

    @Bean
    public MinioClient minioClient() {
        var minio = properties.getMinio();
        return MinioClient.builder()
                .endpoint(minio.getEndpoint())
                .credentials(minio.getAccessKey(), minio.getSecretKey())
                .build();
    }
}
