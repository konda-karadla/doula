declare const _default: () => {
    port: number;
    database: {
        url: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string | undefined;
    };
    refreshToken: {
        secret: string | undefined;
        expiresIn: string | undefined;
    };
    redis: {
        host: string | undefined;
        port: number;
    };
    aws: {
        region: string | undefined;
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        s3BucketName: string | undefined;
    };
};
export default _default;
