import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./dto/auth.dto").AuthTokensDto>;
    login(dto: LoginDto): Promise<import("./dto/auth.dto").AuthTokensDto>;
    refresh(dto: RefreshTokenDto): Promise<import("./dto/auth.dto").AuthTokensDto>;
    logout(dto: RefreshTokenDto): Promise<void>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
