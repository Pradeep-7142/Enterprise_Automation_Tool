package com.flowdesk.service.impl;

import com.flowdesk.constant.Enums;
import com.flowdesk.dto.request.*;
import com.flowdesk.dto.response.AuthLoginResponse;
import com.flowdesk.dto.response.UserProfileDto;
import com.flowdesk.entity.*;
import com.flowdesk.exception.BusinessException;
import com.flowdesk.mapper.UserProfileMapper;
import com.flowdesk.repository.*;
import com.flowdesk.security.JwtService;
import com.flowdesk.service.AuthService;
import com.flowdesk.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserProfileMapper userProfileMapper;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            OtpTokenRepository otpTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserProfileMapper userProfileMapper) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpTokenRepository = otpTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userProfileMapper = userProfileMapper;
    }

    @Override
    @Transactional
    public AuthLoginResponse login(AuthLoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthLoginResponse signup(SignupRequest request) {
        if (userRepository.findByEmailAndDeletedFalse(request.getEmail()).isPresent()) {
            throw new BusinessException("Email already registered", HttpStatus.CONFLICT);
        }
        
        String orgName = request.getOrganizationName() != null ? request.getOrganizationName().trim() : "Acme Corp";
        String slug = orgName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        if (slug.isEmpty()) {
            slug = "org-" + UUID.randomUUID().toString().substring(0, 8);
        }
        
        final String finalSlug = slug;
        Organization org = organizationRepository.findBySlugAndDeletedFalse(finalSlug)
                .orElseGet(() -> {
                    Organization o = new Organization();
                    o.setName(orgName);
                    o.setSlug(finalSlug);
                    return organizationRepository.save(o);
                });

        long userCount = userRepository.countByOrganizationIdAndDeletedFalse(org.getId());
        Enums.SystemRole systemRole = (userCount == 0) ? Enums.SystemRole.ORG_ADMIN : Enums.SystemRole.EMPLOYEE;

        Role role = roleRepository.findByNameAndDeletedFalse(systemRole)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName(systemRole);
                    r.setDescription(systemRole.name());
                    return roleRepository.save(r);
                });

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setOrganization(org);
        user.setRole(role);
        user.setAvatar(request.getFirstName().substring(0, 1).toUpperCase()
                + request.getLastName().substring(0, 1).toUpperCase());
        user.setEmailVerified(false);
        userRepository.save(user);
        return buildAuthResponse(user);
    }


    @Override
    @Transactional
    public AuthLoginResponse refresh(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByTokenAndRevokedFalseAndDeletedFalse(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException("Invalid refresh token", HttpStatus.UNAUTHORIZED));
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException("Refresh token expired", HttpStatus.UNAUTHORIZED);
        }
        token.setRevoked(true);
        refreshTokenRepository.save(token);
        return buildAuthResponse(token.getUser());
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByTokenAndRevokedFalseAndDeletedFalse(refreshToken)
                .ifPresent(t -> {
                    t.setRevoked(true);
                    refreshTokenRepository.save(t);
                });
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailAndDeletedFalse(request.getEmail()).ifPresent(user -> {
            OtpToken otp = new OtpToken();
            otp.setUser(user);
            otp.setCode(String.format("%06d", (int) (Math.random() * 1_000_000)));
            otp.setPurpose("PASSWORD_RESET");
            otp.setExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));
            otpTokenRepository.save(otp);
        });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        OtpToken otp = otpTokenRepository.findTopByUserIdAndPurposeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                UUID.fromString(request.getToken()), "PASSWORD_RESET", Instant.now())
                .orElseThrow(() -> new BusinessException("Invalid or expired reset token", HttpStatus.BAD_REQUEST));
        User user = otp.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otp.setUsed(true);
        otpTokenRepository.save(otp);
    }

    @Override
    @Transactional
    public void verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));
        String purpose = request.getPurpose() != null ? request.getPurpose() : "EMAIL_VERIFY";
        OtpToken otp = otpTokenRepository.findTopByUserIdAndPurposeAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                user.getId(), purpose, Instant.now())
                .orElseThrow(() -> new BusinessException("Invalid OTP", HttpStatus.BAD_REQUEST));
        if (!otp.getCode().equals(request.getCode())) {
            throw new BusinessException("Invalid OTP code", HttpStatus.BAD_REQUEST);
        }
        otp.setUsed(true);
        otpTokenRepository.save(otp);
        if ("EMAIL_VERIFY".equals(purpose)) {
            user.setEmailVerified(true);
            userRepository.save(user);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto me() {
        User user = SecurityUtils.getCurrentUser();
        if (user == null) {
            throw new BusinessException("Not authenticated", HttpStatus.UNAUTHORIZED);
        }
        return userProfileMapper.toDto(user);
    }

    private AuthLoginResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        String refreshTokenValue = jwtService.generateRefreshToken(user.getEmail(), user.getId());
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setExpiresAt(Instant.now().plusMillis(jwtService.getAccessTokenExpirationMs() * 48));
        refreshTokenRepository.save(refreshToken);
        return AuthLoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
                .user(userProfileMapper.toDto(user))
                .build();
    }
}
