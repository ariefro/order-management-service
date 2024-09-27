import { NextFunction, Request, Response } from 'express';
import { successResponse } from '../middleware/success-response';
import { OrderService } from '../services/order-service';
import { statusCreated } from '../constants/http-status-code';
import { NotFoundError, ValidationError } from '../errors';

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

			const customerName =
				(req.query.customer_name as string) || undefined;
			const orderDate = (req.query.order_date as string) || undefined;

			const { orders, totalItems } = await this.orderService.getAllOrders(
				{ limit, offset, customerName, orderDate },
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

	public async createOrder(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const { customerName, orderItems } = req.body;

			const order = await this.orderService.createOrder(
				customerName,
				orderItems,
			);

			successResponse(
				res,
				{ order },
				'Order created successfully',
				undefined,
				statusCreated,
			);
		} catch (error) {
			next(error);
		}
	}

	public async getOrderDetail(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const id = parseInt(req.params.id, 10);
			if (isNaN(id) || id <= 0) {
				throw new ValidationError('Invalid order ID');
			}

			const order = await this.orderService.getOrderById(id);
			if (!order) {
				throw new NotFoundError('Order not found');
			}

			successResponse(
				res,
				{ order },
				'Order detail fetched successfully',
			);
		} catch (error) {
			next(error);
		}
	}
}
