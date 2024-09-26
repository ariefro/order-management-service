import { NextFunction, Request, Response } from 'express';
import { successResponse } from '../middleware/success-response';
import { OrderService } from '../services/order-service';

export default class OrderController {
	private orderService: OrderService;

	constructor() {
		this.orderService = new OrderService();
	}

	public async getAllOrders(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const page = parseInt(req.query.page as string, 10) || 1;
			const limit = parseInt(req.query.limit as string, 10) || 10;

			const offset = (page - 1) * limit;
			const { orders, totalItems } = await this.orderService.getAllOrders(
				{ limit, offset },
			);

			const totalPages = Math.ceil(totalItems / limit);

			successResponse(res, { orders }, 'Orders fetched successfully', {
				totalItems,
				totalPages,
				currentPage: page,
				pageSize: limit,
			});
		} catch (error) {
			next(error);
		}
	}
}
