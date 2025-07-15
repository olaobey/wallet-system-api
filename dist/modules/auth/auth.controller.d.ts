import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: import("../user/interfaces/user.interface").IUser;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: import("../user/interfaces/user.interface").IUser;
    }>;
}
