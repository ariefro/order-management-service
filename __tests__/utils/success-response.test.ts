import { successResponse } from '../../src/utils/success-response';
import { statusOk } from '../../src/constants/http-status-code';
import { Response } from 'express';

describe('successResponse function', () => {
	let mockRes: Partial<Response>;

	beforeEach(() => {
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	it('should return a success response with default message and status code', () => {
		const data = { key: 'value' };

		successResponse(mockRes as Response, data);

		expect(mockRes.status).toHaveBeenCalledWith(statusOk);
		expect(mockRes.json).toHaveBeenCalledWith({
			status: 'success',
			message: 'Operation successful',
			data,
		});
	});

	it('should return a success response with custom message and status code', () => {
		const data = { key: 'value' };
		const customMessage = 'Custom success message';
		const customStatusCode = 201;

		successResponse(
			mockRes as Response,
			data,
			customMessage,
			undefined,
			customStatusCode,
		);

		expect(mockRes.status).toHaveBeenCalledWith(customStatusCode);
		expect(mockRes.json).toHaveBeenCalledWith({
			status: 'success',
			message: customMessage,
			data,
		});
	});

	it('should return a success response with pagination', () => {
		const data = { key: 'value' };
		const pagination = {
			totalItems: 100,
			totalPages: 10,
			currentPage: 1,
			pageSize: 10,
		};

		successResponse(
			mockRes as Response,
			data,
			'Operation successful',
			pagination,
		);

		expect(mockRes.status).toHaveBeenCalledWith(statusOk);
		expect(mockRes.json).toHaveBeenCalledWith({
			status: 'success',
			message: 'Operation successful',
			data,
			pagination,
		});
	});
});
