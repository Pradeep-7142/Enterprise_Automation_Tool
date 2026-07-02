package com.flowdesk.service;

import com.flowdesk.dto.request.*;
import com.flowdesk.dto.response.AuthLoginResponse;
import com.flowdesk.dto.response.UserProfileDto;

public interface AuthService {
    AuthLoginResponse login(AuthLoginRequest request);
    AuthLoginResponse signup(SignupRequest request);
    AuthLoginResponse refresh(RefreshTokenRequest request);
    void logout(String refreshToken);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void verifyOtp(OtpVerifyRequest request);
    UserProfileDto me();
}
