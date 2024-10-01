import { Prisma } from '@prisma/client';
import logger from '../../src/configs/logger';
import { OrderItemRepository } from '../../src/repositories/order-item-repository';

jest.mock('../../src/configs/logger');

describe('OrderItemRepository.deleteManyByOrderIdInTransaction', () => {
	let mockTx: Prisma.TransactionClient;
	let orderItemRepository: OrderItemRepository;

	beforeEach(() => {
		mockTx = {
			orderItem: {
				deleteMany: jest.fn(),
			},
		} as unknown as Prisma.TransactionClient;

		orderItemRepository = new OrderItemRepository();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should delete multiple order items by orderId', async () => {
		const orderId = 1;
		const mockDeleteResponse = { count: 2 }; // Simulating the response from deleteMany

		(mockTx.orderItem.deleteMany as jest.Mock).mockResolvedValue(
			mockDeleteResponse,
		);

		const result =
			await orderItemRepository.deleteManyByOrderIdInTransaction(
				mockTx,
				orderId,
			);

		expect(mockTx.orderItem.deleteMany).toHaveBeenCalledWith({
			where: { orderId },
		});
		expect(result).toEqual(mockDeleteResponse);
	});

	it('should log and throw an error if deleteMany fails', async () => {
		const orderId = 1;
		const mockError = new Error('Database error');
		(mockTx.orderItem.deleteMany as jest.Mock).mockRejectedValue(mockError);

		await expect(
			orderItemRepository.deleteManyByOrderIdInTransaction(
				mockTx,
				orderId,
			),
		).rejects.toThrow(mockError);

		expect(logger.error).toHaveBeenCalledWith(
			'Error in OrderItemRepository.deleteByIdInTransaction: ',
			mockError,
		);
	});
});
