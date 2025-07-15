import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IUser } from './interfaces/user.interface';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<IUser>;
    getProfile(user: IUser): Promise<IUser>;
}
