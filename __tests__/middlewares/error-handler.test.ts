import errorHandler from '../../src/middlewares/error-handler';
import {
	ValidationError,
	NotFoundError,
	InternalServerError,
} from '../../src/errors';
import { Response, Request, NextFunction } from 'express';

describe('Error handler middleware', () => {
	let mockRes: Partial<Response>;
	let mockReq: Partial<Request>;
	let mockNext: NextFunction;

	beforeEach(() => {
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		mockReq = {};
		mockNext = jest.fn();
	});

	it('should handle ValidationError', () => {
		const validationError = new ValidationError(
			'Validation error occurred',
		);
		errorHandler(
			validationError,
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(validationError.status);
		expect(mockRes.json).toHaveBeenCalledWith({
			status: 'error',
			message: validationError.message,
		});
	});

	it('should handle NotFoundError', () => {
		const notFoundError = new NotFoundError('Resource not found');
		errorHandler(
			notFoundError,
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(notFoundError.status);
		expect(mockRes.json).toHaveBeenCalledWith({
			status: 'error',
			message: notFoundError.message,
		});
	});

	it('should handle InternalServerError', () => {
		const internalServerError = new InternalServerError(
			'Internal Server Error',
		);
		errorHandler(
			internalServerError,
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(internalServerError.status);
		expect(mockRes.json).toHaveBeenCalledWith({
			status: 'error',
			message: internalServerError.message,
		});
	});

	it('should handle unknown errors with a 500 status', () => {
		const unknownError = new Error('An unexpected error occurred');
		errorHandler(
			unknownError,
			mockReq as Request,
			mockRes as Response,
			mockNext,
		);

		expect(mockRes.status).toHaveBeenCalledWith(500);
		expect(mockRes.json).toHaveBeenCalledWith({
			status: 'error',
			message: unknownError.message,
		});
	});
});
