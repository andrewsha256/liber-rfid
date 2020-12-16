import assert from 'assert';
import {
    BadRequestError,
    InternalServerError,
    NotFoundError,
} from '../../lib/app-errors';

describe('AppErrors', () => {
    it('BadRequestError should have a correct constructor', () => {
        const error = new BadRequestError('message');
        assert.strictEqual(error.code, 400);
        assert.strictEqual(error.message, 'message');
        assert.ok(error.name);
    });

    it('BadRequestError should be an instance of Error', () => {
        const error = new BadRequestError('message');
        assert.ok(error instanceof Error);
    });

    it('NotFoundError should have a correct constructor', () => {
        const error = new NotFoundError('message');
        assert.strictEqual(error.code, 404);
        assert.strictEqual(error.message, 'message');
        assert.ok(error.name);
    });

    it('NotFoundError should be an instance of Error', () => {
        const error = new NotFoundError('message');
        assert.ok(error instanceof Error);
    });

    it('InternalServerError should have a correct constructor', () => {
        const error = new InternalServerError('message');
        assert.strictEqual(error.code, 500);
        assert.strictEqual(error.message, 'message');
        assert.ok(error.name);
    });

    it('InternalServerError should be an instance of Error', () => {
        const error = new NotFoundError('message');
        assert.ok(error instanceof Error);
    });
});
