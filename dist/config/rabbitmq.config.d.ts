export declare const rabbitmqConfig: (() => {
    url: string;
    queue: {
        transaction: string | undefined;
        deadLetter: string | undefined;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
    queue: {
        transaction: string | undefined;
        deadLetter: string | undefined;
    };
}>;
