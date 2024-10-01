import { Customer, Prisma } from '@prisma/client';
import { CustomerService } from '../../src/services';
import { CustomerRepository } from '../../src/repositories';
import logger from '../../src/configs/logger';

jest.mock('../../src/repositories/customer-repository.ts');
jest.mock('../../src/configs/logger.ts');

describe('CustomerService', () => {
	let mockTx: Prisma.TransactionClient;
	let customerService: CustomerService;
	let customerRepositoryMock: jest.Mocked<CustomerRepository>;

	beforeEach(() => {
		mockTx = {} as Prisma.TransactionClient;

		customerRepositoryMock =
			new CustomerRepository() as jest.Mocked<CustomerRepository>;
		customerService = new CustomerService();

		(customerService as any).customerRepository = customerRepositoryMock;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should find or create a customer in a transaction', async () => {
		const mockCustomer: Customer = {
			id: 1,
			name: 'John Doe',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		customerRepositoryMock.findOrCreateByNameInTransaction.mockResolvedValue(
			mockCustomer,
		);

		const result =
			await customerService.findOrCreateCustomerByNameInTransaction(
				mockTx,
				'John Doe',
			);

		expect(
			customerRepositoryMock.findOrCreateByNameInTransaction,
		).toHaveBeenCalledWith(mockTx, 'John Doe');
		expect(result).toEqual(mockCustomer);
	});

	it('should log and throw an error if findOrCreateCustomerByNameInTransaction fails', async () => {
		const mockError = new Error('Database error');
		customerRepositoryMock.findOrCreateByNameInTransaction.mockRejectedValue(
			mockError,
		);

		await expect(
			customerService.findOrCreateCustomerByNameInTransaction(
				mockTx,
				'John Doe',
			),
		).rejects.toThrow(mockError);

		expect(logger.error).toHaveBeenCalledWith(
			'Error in CustomerService.findOrCreateCustomerByNameInTransaction: ',
			mockError,
		);
	});
});
