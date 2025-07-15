import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../../modules/user/user.service';
import { JwtPayload } from '../../../common/types';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userService;
    private readonly configService;
    constructor(userService: UserService, configService: ConfigService);
    validate(payload: JwtPayload): Promise<import("../../user/interfaces/user.interface").IUser>;
}
export {};
