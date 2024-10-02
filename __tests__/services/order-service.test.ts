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

	const mockOrders = [
		{
			id: 1,
			totalOrderPrice: 10000,
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
					price: 50,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
		},
		{
			id: 2,
			totalOrderPrice: 20000,
			createdAt: new Date(),
			updatedAt: new Date(),
			customerId: 2,
			customer: {
				id: 2,
				name: 'Jane Doe',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			orderItems: [
				{
					id: 2,
					orderId: 2,
					productId: 2,
					quantity: 1,
					price: 200,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
		},
	];

	const mockParams = {
		offset: 0,
		limit: 10,
		customerName: undefined,
		orderDate: undefined,
	};

	describe('getAllOrders', () => {
		it('should return all orders with total products and total items', async () => {
			mockOrderRepository.findAllWithPagination.mockResolvedValue(
				mockOrders,
			);
			mockOrderRepository.countAll.mockResolvedValue(2);

			const result = await orderService.getAllOrders(mockParams);

			expect(result.orders).toHaveLength(2);
			expect(result.orders[0]).toHaveProperty('totalProducts', 1);
			expect(result.orders[1]).toHaveProperty('totalProducts', 1);
			expect(result.totalItems).toBe(2);

			expect(
				mockOrderRepository.findAllWithPagination,
			).toHaveBeenCalledWith({
				offset: mockParams.offset,
				limit: mockParams.limit,
				filters: {},
			});
			expect(mockOrderRepository.countAll).toHaveBeenCalledWith({});
		});

		it('should filter orders by customer name', async () => {
			const filters = {
				customer: { name: { contains: 'John', mode: 'insensitive' } },
			};
			mockOrderRepository.findAllWithPagination.mockResolvedValue(
				mockOrders,
			);
			mockOrderRepository.countAll.mockResolvedValue(1);

			const result = await orderService.getAllOrders({
				offset: mockParams.offset,
				limit: mockParams.limit,
				customerName: 'John',
				orderDate: '',
			});

			expect(
				mockOrderRepository.findAllWithPagination,
			).toHaveBeenCalledWith({
				offset: mockParams.offset,
				limit: mockParams.limit,
				filters,
			});
			expect(result.totalItems).toBe(1);
		});

		it('should filter orders by order date', async () => {
			const filters = {
				createdAt: {
					gte: new Date('2024-10-01T00:00:00Z'),
					lte: new Date('2024-10-01T23:59:59Z'),
				},
			};
			mockOrderRepository.findAllWithPagination.mockResolvedValue(
				mockOrders,
			);
			mockOrderRepository.countAll.mockResolvedValue(1);

			const result = await orderService.getAllOrders({
				offset: mockParams.offset,
				limit: mockParams.limit,
				customerName: '',
				orderDate: '2024-10-01',
			});

			expect(
				mockOrderRepository.findAllWithPagination,
			).toHaveBeenCalledWith({
				offset: mockParams.offset,
				limit: mockParams.limit,
				filters,
			});
			expect(result.totalItems).toBe(1);
		});

		it('should log and rethrow an error if fetching orders fails', async () => {
			const errorMessage = 'An unexpected error occurred';
			mockOrderRepository.findAllWithPagination.mockRejectedValue(
				new Error(errorMessage),
			);

			await expect(orderService.getAllOrders(mockParams)).rejects.toThrow(
				errorMessage,
			);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in OrderService.getAllOrders:',
				expect.any(Error),
			);
		});
	});

	describe('getOrderById', () => {
		it('should return the order when found', async () => {
			mockOrderRepository.findById.mockResolvedValue(mockOrder);

			const result = await orderService.getOrderById(1);

			expect(result).toEqual(mockOrder);
			expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
		});

		it('should throw NotFoundError if the order is not found', async () => {
			mockOrderRepository.findById.mockResolvedValue(null);

			await expect(orderService.getOrderById(1)).rejects.toThrow(
				NotFoundError,
			);
			expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
		});

		it('should log error and throw when repository throws an error', async () => {
			const error = new Error('An unexpected error occurred');
			mockOrderRepository.findById.mockRejectedValue(error);

			await expect(orderService.getOrderById(1)).rejects.toThrow(error);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in OrderService.getOrderById: ',
				error,
			);
		});
	});
});
