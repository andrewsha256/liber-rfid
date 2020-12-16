export interface AppError {
    code: number;
    name: string;
}

export class BadRequestError extends Error implements AppError {
    code: number;
    name: string;

    constructor(message: string) {
        super(message);
        this.code = 400;
        this.name = 'Bad Request';
    }
}

export class NotFoundError extends Error implements AppError {
    code: number;
    name: string;

    constructor(message: string) {
        super(message);
        this.code = 404;
        this.name = 'Not Found';
    }
}

export class InternalServerError extends Error implements AppError {
    code: number;
    name: string;

    constructor(message: string) {
        super(message);
        this.code = 500;
        this.name = 'Internal Error';
    }
}
