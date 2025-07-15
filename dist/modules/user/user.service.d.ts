import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { IUser } from './interfaces/user.interface';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<IUser>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<IUser>;
    validateUser(email: string, password: string): Promise<IUser | null>;
}
