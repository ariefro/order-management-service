import { OrderService } from '../../src/services/order-service';
import { OrderRepository } from '../../src/repositories/order-repository';
import { CustomerRepository } from '../../src/repositories/customer-repository';
import { OrderItemRepository } from '../../src/repositories/order-item-repository';
import { ProductRepository } from '../../src/repositories/product-repository';
import { PrismaClient } from '@prisma/client';
import logger from '../../src/configs/logger';
import { NotFoundError } from '../../src/errors';

jest.mock('../../src/repositories/order-repository');
jest.mock('../../src/repositories/customer-repository');
jest.mock('../../src/repositories/order-item-repository');
jest.mock('../../src/repositories/product-repository');
jest.mock('../../src/configs/logger');

describe('OrderService', () => {
	let orderService: OrderService;
	let mockPrisma: jest.Mocked<PrismaClient>;
	let mockOrderRepository: jest.Mocked<OrderRepository>;
	let mockCustomerRepository: jest.Mocked<CustomerRepository>;
	let mockOrderItemRepository: jest.Mocked<OrderItemRepository>;
	let mockProductRepository: jest.Mocked<ProductRepository>;

	beforeEach(() => {
		mockOrderRepository = new OrderRepository(
			mockPrisma,
		) as jest.Mocked<OrderRepository>;
		mockCustomerRepository =
			new CustomerRepository() as jest.Mocked<CustomerRepository>;
		mockOrderItemRepository =
			new OrderItemRepository() as jest.Mocked<OrderItemRepository>;
		mockProductRepository = new ProductRepository(
			mockPrisma,
		) as jest.Mocked<ProductRepository>;

		orderService = new OrderService(
			mockPrisma,
			mockOrderRepository,
			mockOrderItemRepository,
			mockCustomerRepository,
			mockProductRepository,
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const mockOrder = {
		id: 1,
		totalOrderPrice: 108000,
		createdAt: new Date(),
		updatedAt: new Date(),
		customerId: 1,
		customer: {
			id: 1,
			name: 'John Doe',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		orderItems: [
			{
				id: 1,
				orderId: 1,
				productId: 1,
				quantity: 2,
				price: 54000,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: 2,
				orderId: 1,
				productId: 2,
				quantity: 1,
				price: 108000,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		],
	};

	describe('getOrderById', () => {
		it('should return the order when found', async () => {
			mockOrderRepository.findById.mockResolvedValue(mockOrder);

			const result = await orderService.getOrderById(1);

			expect(result).toEqual(mockOrder);
			expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
		});

		it('should throw NotFoundError if the order is not found', async () => {
			mockOrderRepository.findById.mockResolvedValue(null); // Mock return null

			await expect(orderService.getOrderById(1)).rejects.toThrow(
				NotFoundError,
			);
			expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
		});

		it('should log error and throw when repository throws an error', async () => {
			const error = new Error('Database error');
			mockOrderRepository.findById.mockRejectedValue(error);

			await expect(orderService.getOrderById(1)).rejects.toThrow(error);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in OrderService.getOrderById: ',
				error,
			);
		});
	});
});
