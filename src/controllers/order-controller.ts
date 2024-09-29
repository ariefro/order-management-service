import { NextFunction, Request, Response } from 'express';
import { successResponse } from '../middlewares/success-response';
import { OrderService } from '../services/order-service';
import { statusCreated } from '../constants/http-status-code';
import { ValidationError } from '../errors';

interface OrderItemInput {
	productId: number;
	quantity: number;
}

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

			this.validateCreateOrderInput(customerName, orderItems);

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

			successResponse(res, { order }, 'Order fetched successfully');
		} catch (error) {
			next(error);
		}
	}

	public async editOrder(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const id = parseInt(req.params.id, 10);
			if (isNaN(id) || id <= 0) {
				throw new ValidationError('Invalid order ID');
			}

			const { orderItems } = req.body;

			this.validateOrderItems(orderItems);

			const order = await this.orderService.editOrderById(id, orderItems);

			successResponse(res, { order }, 'Order updated successfully');
		} catch (error) {
			next(error);
		}
	}

	public async deleteOrder(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const id = parseInt(req.params.id, 10);
			if (isNaN(id) || id <= 0) {
				throw new ValidationError('Invalid order ID');
			}

			await this.orderService.deleteOrderById(id);

			successResponse(res, undefined, 'Successfully deleted order');
		} catch (error) {
			next(error);
		}
	}

	private validateCustomerName(name: string): void {
		if (!name || typeof name !== 'string' || name.trim() === '') {
			throw new ValidationError('Customer name is required');
		}
	}

	private validateOrderItems(orderItems: OrderItemInput[]): void {
		if (!orderItems || orderItems.length === 0) {
			throw new ValidationError('Order must have at least one product');
		}

		for (const item of orderItems) {
			if (!item.productId) {
				throw new ValidationError('Please fill all of mandatory field');
			}

			if (isNaN(item.productId)) {
				throw new ValidationError('Invalid product ID');
			}

			if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
				throw new ValidationError(
					'Quantity is required and must be greater than 0',
				);
			}
		}
	}

	private validateCreateOrderInput(
		customerName: string,
		orderItems: OrderItemInput[],
	): void {
		this.validateCustomerName(customerName);
		this.validateOrderItems(orderItems);
	}
}
