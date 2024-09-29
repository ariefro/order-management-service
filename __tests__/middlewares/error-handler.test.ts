import express from 'express';
import request from 'supertest';
import errorHandler from '../../src/middlewares/error-handler';
import {
	ValidationError,
	NotFoundError,
	InternalServerError,
} from '../../src/errors';

// Mock errors
const mockValidationError = new ValidationError('Validation error occurred');
const mockNotFoundError = new NotFoundError('Resource not found');
const mockInternalServerError = new InternalServerError(
	'Internal Server Error',
);

describe('Error Handler Middleware', () => {
	let app: express.Express;

	beforeEach(() => {
		app = express();
		app.use(express.json());

		// Sample route to trigger errors
		app.get('/test-validation-error', (_req, _res, next) => {
			next(mockValidationError);
		});

		app.get('/test-not-found-error', (_req, _res, next) => {
			next(mockNotFoundError);
		});

		app.get('/test-internal-server-error', (_req, _res, next) => {
			next(mockInternalServerError);
		});

		app.get('/test-unknown-error', (_req, _res, next) => {
			next(new Error('An unexpected error occurred'));
		});

		app.use(errorHandler);
	});

	it('should handle ValidationError', async () => {
		const res = await request(app).get('/test-validation-error');

		expect(res.status).toBe(mockValidationError.status);
		expect(res.body).toEqual({
			status: 'error',
			message: mockValidationError.message,
		});
	});

	it('should handle NotFoundError', async () => {
		const res = await request(app).get('/test-not-found-error');

		expect(res.status).toBe(mockNotFoundError.status);
		expect(res.body).toEqual({
			status: 'error',
			message: mockNotFoundError.message,
		});
	});

	it('should handle InternalServerError', async () => {
		const res = await request(app).get('/test-internal-server-error');

		expect(res.status).toBe(mockInternalServerError.status);
		expect(res.body).toEqual({
			status: 'error',
			message: mockInternalServerError.message,
		});
	});

	it('should handle unknown errors (default to 500)', async () => {
		const res = await request(app).get('/test-unknown-error');

		expect(res.status).toBe(500);
		expect(res.body).toEqual({
			status: 'error',
			message: 'An unexpected error occurred',
		});
	});
});
