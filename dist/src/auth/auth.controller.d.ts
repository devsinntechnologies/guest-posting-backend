import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, RegisterDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./dto/auth.dto").MessageResponseDto>;
    login(dto: LoginDto): Promise<import("./dto/auth.dto").AuthTokensDto>;
    refresh(dto: RefreshTokenDto): Promise<import("./dto/auth.dto").AuthTokensDto>;
    logout(dto: RefreshTokenDto): Promise<import("./dto/auth.dto").MessageResponseDto>;
    forgotPassword(dto: ForgotPasswordDto): Promise<import("./dto/auth.dto").MessageResponseDto>;
    resetPassword(dto: ResetPasswordDto): Promise<import("./dto/auth.dto").MessageResponseDto>;
    verifyEmail(dto: VerifyEmailDto): Promise<import("./dto/auth.dto").MessageResponseDto>;
    verifyEmailQuery(dto: VerifyEmailDto): Promise<import("./dto/auth.dto").MessageResponseDto>;
    resendVerification(dto: ForgotPasswordDto): Promise<import("./dto/auth.dto").MessageResponseDto>;
}
