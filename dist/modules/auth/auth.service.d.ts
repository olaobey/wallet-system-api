import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: import("../user/interfaces/user.interface").IUser;
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: import("../user/interfaces/user.interface").IUser;
    }>;
}
