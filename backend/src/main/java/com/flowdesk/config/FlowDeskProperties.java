package com.flowdesk.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "flowdesk")
public class FlowDeskProperties {
    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private Minio minio = new Minio();
    private boolean seedData = false;

    @Data
    public static class Jwt {
        private String secret;
        private long accessTokenExpirationMs = 900_000;
        private long refreshTokenExpirationMs = 604_800_000;
    }

    @Data
    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173");
    }

    @Data
    public static class Minio {
        private String endpoint = "http://localhost:9000";
        private String accessKey = "minioadmin";
        private String secretKey = "minioadmin";
        private String bucket = "flowdesk-files";
    }
}
