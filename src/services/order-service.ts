import { Order } from '@prisma/client';
import logger from '../config/logger';
import prisma from '../../prisma/client';

interface PaginatioParams {
	offset: number;
	limit: number;
	customerName?: string;
	orderDate?: string;
}

export class OrderService {
	async getAllOrders({
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
}
