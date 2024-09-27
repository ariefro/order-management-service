import { Prisma } from '@prisma/client';
import logger from '../config/logger';
import { InternalServerError } from '../errors';
import { CustomerRepository } from '../repositories/customer-repository';

export class CustomerService {
	private customerRepository: CustomerRepository;

	constructor() {
		this.customerRepository = new CustomerRepository();
	}

	public async findOrCreateCustomerByNameInTransaction(
		tx: Prisma.TransactionClient,
		name: string,
	) {
		try {
			return await this.customerRepository.findOrCreateByNameInTransaction(
				tx,
				name,
			);
		} catch (error) {
			logger.error(
				'Error in CustomerService.findOrCreateCustomerByNameInTransaction: ',
				error,
			);
			throw new InternalServerError('Failed to find or create customer');
		}
	}
}
