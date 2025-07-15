import { DataSource } from 'typeorm';
export declare const databaseConfig: (() => {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
    synchronize: boolean;
    logging: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean | {
        rejectUnauthorized: boolean;
    };
    synchronize: boolean;
    logging: boolean;
}>;
export declare const AppDataSource: DataSource;
