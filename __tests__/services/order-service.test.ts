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
		mockPrisma = {
			$transaction: jest.fn(),
		} as unknown as jest.Mocked<PrismaClient>;

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

	const orderId = 1;
	const mockOrderItems = [
		{
			id: 1,
			orderId,
			productId: 1,
			quantity: 2,
			price: 54000,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];
	const mockValidatedOrderItems = [
		{
			id: 1,
			orderId,
			productId: 1,
			quantity: 2,
			price: 54000,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	const mockOrder = {
		id: orderId,
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
					price: 5000,
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
					price: 10000,
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
			expect(result.orders[0]).toHaveProperty('totalItems', 1);
			expect(result.orders[1]).toHaveProperty('totalItems', 1);
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

	describe('createOrder', () => {
		it('should throw an error if selected product not found', async () => {
			const customerName = 'John Doe';
			const errorMessage = 'One or more products not found';

			mockPrisma.$transaction.mockRejectedValue(new Error(errorMessage));

			await expect(
				orderService.createOrder(customerName, mockOrderItems),
			).rejects.toThrow(errorMessage);
			// expect(mockPrisma.$transaction).toHaveBeenCalled();
		});
	});

	describe('editOrder', () => {
		it('should update the order if it exists', async () => {
			const mockTotalPrice = 54000;

			// Mock the private methods
			jest.spyOn(
				orderService as any,
				'validateOrderItems',
			).mockResolvedValue(mockValidatedOrderItems);
			jest.spyOn(
				orderService as any,
				'calculateTotalOrderPrice',
			).mockReturnValue(mockTotalPrice);

			mockOrderRepository.findById.mockResolvedValue(mockOrder);

			mockOrderRepository.updateById.mockResolvedValue(mockOrder);

			const result = await orderService.editOrderById(
				orderId,
				mockOrderItems,
			);

			expect(result).toEqual(mockOrder);
			expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
			expect(orderService['validateOrderItems']).toHaveBeenCalledWith(
				mockOrderItems,
			);
			expect(
				orderService['calculateTotalOrderPrice'],
			).toHaveBeenCalledWith(mockValidatedOrderItems);
			expect(mockOrderRepository.updateById).toHaveBeenCalledWith(
				orderId,
				mockValidatedOrderItems,
				mockTotalPrice,
			);
		});

		it('should throw NotFoundError if order does not exist', async () => {
			const orderId = 1;

			jest.spyOn(
				orderService as any,
				'validateOrderItems',
			).mockResolvedValue(null);
			jest.spyOn(
				orderService as any,
				'calculateTotalOrderPrice',
			).mockReturnValue(null);

			mockOrderRepository.findById.mockResolvedValue(null);

			await expect(
				orderService.editOrderById(orderId, mockOrderItems),
			).rejects.toThrow(NotFoundError);

			expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
			expect(orderService['validateOrderItems']).not.toHaveBeenCalled();
			expect(
				orderService['calculateTotalOrderPrice'],
			).not.toHaveBeenCalled();
		});
	});

	describe('deleteOrder', () => {
		it('should delete order and order items if order exists', async () => {
			const orderId = 1;

			// Simulate order found
			mockOrderRepository.findById.mockResolvedValue(mockOrder);

			// Mock the transaction
			mockPrisma.$transaction.mockImplementation(async (callback) => {
				return await callback(mockPrisma);
			});

			// Simulate successful deletion
			mockOrderItemRepository.deleteManyByOrderIdInTransaction.mockResolvedValue(
				{
					count: 1, // Assuming 1 item is deleted
				},
			);
			mockOrderRepository.deleteByIdInTransaction.mockResolvedValue(
				mockOrder,
			);

			const result = await orderService.deleteOrderById(orderId);

			expect(result).toBe(true);
			expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
			expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
			expect(
				mockOrderItemRepository.deleteManyByOrderIdInTransaction,
			).toHaveBeenCalledWith(mockPrisma, orderId);
			expect(
				mockOrderRepository.deleteByIdInTransaction,
			).toHaveBeenCalledWith(mockPrisma, orderId);
		});

		it('should throw NotFoundError if order does not exist', async () => {
			const orderId = 1;

			mockOrderRepository.findById.mockResolvedValue(null);

			await expect(orderService.deleteOrderById(orderId)).rejects.toThrow(
				NotFoundError,
			);

			expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
			expect(mockPrisma.$transaction).not.toHaveBeenCalled();
		});
	});
});
