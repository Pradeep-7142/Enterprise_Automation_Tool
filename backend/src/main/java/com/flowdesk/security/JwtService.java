package com.flowdesk.security;

import com.flowdesk.config.FlowDeskProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    private final FlowDeskProperties properties;

    public JwtService(FlowDeskProperties properties) {
        this.properties = properties;
    }

    public String generateAccessToken(String email, UUID userId) {
        return buildToken(email, userId, properties.getJwt().getAccessTokenExpirationMs());
    }

    public String generateRefreshToken(String email, UUID userId) {
        return buildToken(email, userId, properties.getJwt().getRefreshTokenExpirationMs());
    }

    private String buildToken(String email, UUID userId, long expirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(email)
                .claim("uid", userId.toString())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public UUID extractUserId(String token) {
        String uid = extractClaim(token, claims -> claims.get("uid", String.class));
        return uid != null ? UUID.fromString(uid) : null;
    }

    public boolean isTokenValid(String token, String email) {
        String subject = extractEmail(token);
        return subject.equals(email) && !isTokenExpired(token);
    }

    public long getAccessTokenExpirationMs() {
        return properties.getJwt().getAccessTokenExpirationMs();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }

    private SecretKey getSigningKey() {
        String secret = properties.getJwt().getSecret();
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception ex) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
