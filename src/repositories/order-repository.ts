import { Order, Prisma } from '@prisma/client';
import logger from '../config/logger';
import prisma from '../../prisma/client';
import { InternalServerError } from '../errors';

interface PaginatioParams {
	offset: number;
	limit: number;
	filters: any;
}

export class OrderRepository {
	constructor() {}

	public async findAllWithPagination({
		offset,
		limit,
		filters,
	}: PaginatioParams) {
		try {
			const orders = await prisma.order.findMany({
				where: filters,
				skip: offset,
				take: limit,
				include: {
					customer: true,
					orderItems: true,
				},
			});

			return orders;
		} catch (error) {
			logger.error('Error in OrderRepository.getAllOrders:', error);
			throw error;
		}
	}

	public async countAll(filters: any) {
		try {
			return await prisma.order.count({ where: filters });
		} catch (error) {
			logger.error('Error in OrderRepository.getAllOrders:', error);
			throw error;
		}
	}

	public async createInTransaction(
		tx: Prisma.TransactionClient,
		customerId: number,
		totalOrderPrice: number,
		orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[],
	): Promise<Order> {
		try {
			const order = await tx.order.create({
				data: {
					customer: { connect: { id: customerId } },
					totalOrderPrice,
					orderItems: {
						create: orderItemsData,
					},
				},
			});

			return order;
		} catch (error) {
			logger.error(
				'Error in OrderRepository.createInTransaction:',
				error,
			);
			throw new InternalServerError('Failed to create order');
		}
	}

	public async findById(id: number) {
		try {
			return await prisma.order.findUnique({
				where: { id },
				include: { customer: true, orderItems: true },
			});
		} catch (error) {
			logger.error('Error in OrderRepository.findById: ', error);
			throw error;
		}
	}

	public async updateById(
		id: number,
		orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[],
		totalOrderPrice: number,
	): Promise<Order> {
		try {
			return await prisma.order.update({
				where: { id },
				data: {
					totalOrderPrice,
					orderItems: { deleteMany: {}, create: orderItemsData },
				},
			});
		} catch (error) {
			logger.error('Error in OrderRepository.updateById: ', error);
			throw error;
		}
	}

	public async deleteByIdInTransaction(
		tx: Prisma.TransactionClient,
		id: number,
	) {
		try {
			return await tx.order.delete({
				where: { id },
			});
		} catch (error) {
			logger.error(
				'Error in OrderRepository.deleteByIdInTransaction: ',
				error,
			);
			throw error;
		}
	}
}
