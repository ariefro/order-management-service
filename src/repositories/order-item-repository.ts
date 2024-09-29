import { Prisma } from '@prisma/client';
import logger from '../configs/logger';

export class OrderItemRepository {
	public async deleteManyByOrderIdInTransaction(
		tx: Prisma.TransactionClient,
		orderId: number,
	) {
		try {
			return await tx.orderItem.deleteMany({
				where: { orderId },
			});
		} catch (error) {
			logger.error(
				'Error in OrderItemRepository.deleteByIdInTransaction: ',
				error,
			);
			throw error;
		}
	}
}
