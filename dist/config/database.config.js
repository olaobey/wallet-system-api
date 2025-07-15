"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.databaseConfig = void 0;
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
exports.databaseConfig = (0, config_1.registerAs)('database', () => ({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'wallet_system',
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
}));
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'wallet_system',
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
});
//# sourceMappingURL=database.config.js.map