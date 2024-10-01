import { CustomerRepository } from '../../src/repositories/customer-repository';
import { Prisma } from '@prisma/client';
import logger from '../../src/configs/logger';

jest.mock('@prisma/client');
jest.mock('../../src/configs/logger');

describe('CustomerRepository', () => {
	let mockTx: Prisma.TransactionClient;
	let customerRepository: CustomerRepository;

	beforeEach(() => {
		// Mock the Prisma Transaction Client
		mockTx = {
			customer: {
				findFirst: jest.fn(),
				create: jest.fn(),
			},
		} as unknown as Prisma.TransactionClient;

		// Initialize the repository with the mocked PrismaClient
		customerRepository = new CustomerRepository();
	});

	afterEach(() => {
		jest.clearAllMocks(); // Clear mocks after each test
	});

	describe('findOrCreateByNameInTransaction', () => {
		it('should find the customer by name if it exists', async () => {
			const mockCustomer = {
				id: 1,
				name: 'John Doe',
			};

			(mockTx.customer.findFirst as jest.Mock).mockResolvedValue(
				mockCustomer,
			);

			const result =
				await customerRepository.findOrCreateByNameInTransaction(
					mockTx,
					'John Doe',
				);

			expect(mockTx.customer.findFirst).toHaveBeenCalledWith({
				where: { name: 'John Doe' },
			});
			expect(mockTx.customer.create).not.toHaveBeenCalled();
			expect(result).toEqual(mockCustomer);
		});

		it('should create a new customer if it does not exist', async () => {
			const mockCustomer = {
				id: 1,
				name: 'John Doe',
			};

			(mockTx.customer.findFirst as jest.Mock).mockResolvedValue(null);
			(mockTx.customer.create as jest.Mock).mockResolvedValue(
				mockCustomer,
			);

			const result =
				await customerRepository.findOrCreateByNameInTransaction(
					mockTx,
					'John Doe',
				);

			expect(mockTx.customer.findFirst).toHaveBeenCalledWith({
				where: { name: 'John Doe' },
			});
			expect(mockTx.customer.create).toHaveBeenCalledWith({
				data: { name: 'John Doe' },
			});
			expect(result).toEqual(mockCustomer);
		});

		it('should log and throw an InternalServerError on failure', async () => {
			const mockError = new Error('Database connection error');

			(mockTx.customer.findFirst as jest.Mock).mockRejectedValue(
				mockError,
			);

			await expect(
				customerRepository.findOrCreateByNameInTransaction(
					mockTx,
					'John Doe',
				),
			).rejects.toThrow(mockError);

			expect(logger.error).toHaveBeenCalledWith(
				'Error in CustomerRepository.findOrCreateCustomerByNameInTransaction: ',
				mockError,
			);
		});
	});
});
