import { Prisma } from '@prisma/client';
import logger from '../config/logger';
import { InternalServerError } from '../errors';

export class CustomerRepository {
	public async findOrCreateByNameInTransaction(
		tx: Prisma.TransactionClient,
		name: string,
	) {
		try {
			let customer = await tx.customer.findFirst({
				where: { name },
			});

			if (!customer) {
				customer = await tx.customer.create({
					data: { name },
				});
			}

			return customer;
		} catch (error) {
			logger.error(
				'Error in CustomerRepository.findOrCreateCustomerByNameInTransaction: ',
				error,
			);
			throw new InternalServerError('Failed to find or create customer');
		}
	}
}
