import { Order } from '@prisma/client';
import logger from '../config/logger';
import prisma from '../../prisma/client';
import { NotFoundError } from '../errors';
import { OrderRepository } from '../repositories/order-repository';
import { CustomerRepository } from '../repositories/customer-repository';
import { OrderItemRepository } from '../repositories/order-item-repository';
import { ProductRepository } from '../repositories/product-repository';

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
	private orderRepository: OrderRepository;
	private customerRepository: CustomerRepository;
	private orderItemRepository: OrderItemRepository;
	private productRepository: ProductRepository;

	constructor() {
		this.orderRepository = new OrderRepository();
		this.customerRepository = new CustomerRepository();
		this.orderItemRepository = new OrderItemRepository();
		this.productRepository = new ProductRepository();
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

			const orders = await this.orderRepository.findAllWithPagination({
				offset,
				limit,
				filters,
			});

			const totalItems = await this.orderRepository.countAll(filters);

			const ordersWithTotalProducts = orders.map((order) => ({
				...order,
				totalProducts: order.orderItems.length,
			}));

			return { orders: ordersWithTotalProducts, totalItems };
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
			const orderItemsData = await this.validateOrderItems(orderItems);

			const totalOrderPrice =
				this.calculateTotalOrderPrice(orderItemsData);

			const transaction = await prisma.$transaction(async (tx) => {
				const customer =
					await this.customerRepository.findOrCreateByNameInTransaction(
						tx,
						customerName,
					);

				const order = await this.orderRepository.createInTransaction(
					tx,
					customer.id,
					totalOrderPrice,
					orderItemsData,
				);

				return order;
			});

			return transaction;
		} catch (error) {
			logger.error('Error in OrderService.createOrder:', error);
			throw error;
		}
	}

	public async getOrderById(id: number) {
		try {
			const order = await this.orderRepository.findById(id);

			if (!order) {
				throw new NotFoundError('Order not found');
			}

			return order;
		} catch (error) {
			logger.error('Error in OrderService.getOrderById: ', error);
			throw error;
		}
	}

	public async editOrderById(
		id: number,
		orderItems: OrderItemInput[],
	): Promise<Order> {
		try {
			const order = await this.orderRepository.findById(id);
			if (!order) {
				throw new NotFoundError('Order not found');
			}

			const orderItemsData = await this.validateOrderItems(orderItems);

			const totalOrderPrice =
				this.calculateTotalOrderPrice(orderItemsData);

			return await this.orderRepository.updateById(
				id,
				orderItemsData,
				totalOrderPrice,
			);
		} catch (error) {
			logger.error('Error in OrderService.editOrderById: ', error);
			throw error;
		}
	}

	public async deleteOrderById(id: number) {
		try {
			const order = await this.orderRepository.findById(id);

			if (!order) {
				throw new NotFoundError('Order not found');
			}

			const transaction = await prisma.$transaction(async (tx) => {
				await this.orderItemRepository.deleteManyByOrderIdInTransaction(
					tx,
					id,
				);

				await this.orderRepository.deleteByIdInTransaction(tx, id);

				return true;
			});

			return transaction;
		} catch (error) {
			logger.error('Error in OrderService.deleteOrderById: ', error);
			throw error;
		}
	}

	private async validateOrderItems(
		orderItems: OrderItemInput[],
	): Promise<any[]> {
		try {
			const orderItemsData = await Promise.all(
				orderItems.map(async (item) => {
					const product = await this.productRepository.findById(
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

			return orderItemsData;
		} catch (error) {
			logger.error('Error in OrderService.validateOrderItems: ', error);
			throw error;
		}
	}

	private calculateTotalOrderPrice(orderItemsData: any[]): number {
		return orderItemsData.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0,
		);
	}
}
