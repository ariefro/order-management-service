import { Order } from '@prisma/client';
import logger from '../config/logger';
import prisma from '../../prisma/client';
import { CustomerService } from './customer-service';
import { ProductService } from './product-service';
import { InternalServerError, NotFoundError } from '../errors';

interface PaginatioParams {
	offset: number;
	limit: number;
	customerName?: string;
	orderDate?: string;
}

interface OrderItemInput {
	productId: number;
	quantity: number;
}

export class OrderService {
	private customerService: CustomerService;
	private productService: ProductService;

	constructor() {
		this.customerService = new CustomerService();
		this.productService = new ProductService();
	}

	public async getAllOrders({
		offset,
		limit,
		customerName,
		orderDate,
	}: PaginatioParams): Promise<{
		orders: Order[];
		totalItems: number;
	}> {
		try {
			const filters: any = {};

			if (customerName) {
				filters.customer = {
					name: {
						contains: customerName,
						mode: 'insensitive',
					},
				};
			}

			if (orderDate) {
				const startOfDay = `${orderDate}T00:00:00Z`;
				const endOfDay = `${orderDate}T23:59:59Z`;

				filters.createdAt = {
					gte: new Date(startOfDay),
					lte: new Date(endOfDay),
				};
			}

			const totalItems = await prisma.order.count({ where: filters });
			const orders = await prisma.order.findMany({
				where: filters,
				skip: offset,
				take: limit,
				include: {
					customer: true,
				},
			});

			return { orders, totalItems };
		} catch (error) {
			logger.error('Error in OrderService.getAllOrders:', error);
			throw error;
		}
	}

	public async createOrder(
		customerName: string,
		orderItems: OrderItemInput[],
	): Promise<Order> {
		try {
			const { orderItemsData } =
				await this.validateOrderItems(orderItems);

			const totalOrderPrice =
				this.calculateTotalOrderPrice(orderItemsData);

			const transaction = await prisma.$transaction(async (tx) => {
				const customer =
					await this.customerService.findOrCreateCustomerByNameInTransaction(
						tx,
						customerName,
					);

				const order = await tx.order.create({
					data: {
						customer: { connect: { id: customer.id } },
						totalOrderPrice,
						orderItem: {
							create: orderItemsData,
						},
					},
				});

				return order;
			});

			return transaction;
		} catch (error) {
			logger.error('Error in OrderService.createOrder:', error);
			throw new InternalServerError('Failed to create order');
		}
	}

	private async validateOrderItems(
		orderItems: OrderItemInput[],
	): Promise<{ orderItemsData: any[] }> {
		const orderItemsData = await Promise.all(
			orderItems.map(async (item) => {
				const product = await this.productService.getProductById(
					item.productId,
				);

				if (!product) {
					throw new NotFoundError(
						`Product with ID ${item.productId} not found`,
					);
				}

				return {
					product: { connect: { id: product.id } },
					quantity: item.quantity,
					price: product.price,
				};
			}),
		);

		return { orderItemsData };
	}

	private calculateTotalOrderPrice(orderItemsData: any[]): number {
		return orderItemsData.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0,
		);
	}
}
