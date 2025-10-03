export interface CurrentUserData {
    userId: string;
    email: string;
    systemId: string;
    system: {
        id: string;
        name: string;
        slug: string;
    };
}
export declare const CurrentUser: (...dataOrPipes: (keyof CurrentUserData | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
