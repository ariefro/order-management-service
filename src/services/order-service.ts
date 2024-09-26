import { Order, PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

interface PaginatioParams {
	offset: number;
	limit: number;
}

export class OrderService {
	async getAllOrders({ offset, limit }: PaginatioParams): Promise<{
		orders: Order[];
		totalItems: number;
	}> {
		try {
			const totalItems = await prisma.order.count();
			const orders = await prisma.order.findMany({
				skip: offset,
				take: limit,
			});

			return { orders, totalItems };
		} catch (error) {
			logger.error('Error in OrderService.getAllOrders:', error);
			throw error;
		}
	}
}
