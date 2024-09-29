import { Response } from 'express';
import { statusOk } from '../constants/http-status-code';

interface Pagination {
	totalItems: number;
	totalPages: number;
	currentPage: number;
	pageSize: number;
}

export function successResponse(
	res: Response,
	data: unknown,
	message: string = 'Operation successful',
	pagination?: Pagination,
	statusCode: number = statusOk,
): Response {
	const responseObject: Record<string, unknown> = {
		status: 'success',
		message,
		data,
	};

	if (pagination) {
		responseObject.pagination = pagination;
	}

	return res.status(statusCode).json(responseObject);
}
