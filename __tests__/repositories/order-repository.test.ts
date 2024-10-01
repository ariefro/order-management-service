import { OrderRepository } from '../../src/repositories/order-repository';
import { Order, Prisma, PrismaClient } from '@prisma/client';
import logger from '../../src/configs/logger';

jest.mock('@prisma/client');
jest.mock('../../src/configs/logger');

describe('OrderRepository', () => {
	let mockPrisma: PrismaClient;
	let mockTx: Prisma.TransactionClient;
	let orderRepository: OrderRepository;

	beforeEach(() => {
		mockPrisma = {
			order: {
				findMany: jest.fn(),
				count: jest.fn(),
			},
		} as unknown as PrismaClient;

		mockTx = {
			order: {
				create: jest.fn(),
			},
		} as unknown as Prisma.TransactionClient;

		orderRepository = new OrderRepository(mockPrisma);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('findAllWithPagination', () => {
		it('should return a list of orders with pagination', async () => {
			const mockOrders = [
				{
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
						},
						{
							id: 2,
							orderId: 1,
							productId: 2,
							quantity: 1,
							price: 108000,
						},
					],
				},
			];

			const paginationParams = {
				offset: 0,
				limit: 10,
				filters: { customerId: 1 },
			};

			(mockPrisma.order.findMany as jest.Mock).mockResolvedValue(
				mockOrders,
			);

			const result =
				await orderRepository.findAllWithPagination(paginationParams);

			expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
				where: paginationParams.filters,
				skip: paginationParams.offset,
				take: paginationParams.limit,
				include: {
					customer: true,
					orderItems: true,
				},
			});
			expect(result).toEqual(mockOrders);
		});

		it('should log and throw an error if findMany fails', async () => {
			const mockError = new Error('Database connection error');
			const paginationParams = {
				offset: 0,
				limit: 10,
				filters: {},
			};

			(mockPrisma.order.findMany as jest.Mock).mockRejectedValue(
				mockError,
			);

			await expect(
				orderRepository.findAllWithPagination(paginationParams),
			).rejects.toThrow(mockError);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in OrderRepository.getAllOrders:',
				mockError,
			);
		});
	});

	describe('countAll', () => {
		it('should return the count of orders', async () => {
			const mockCount = 5;
			const filters = { customerId: 1 };

			(mockPrisma.order.count as jest.Mock).mockResolvedValue(mockCount);

			const result = await orderRepository.countAll(filters);

			expect(mockPrisma.order.count).toHaveBeenCalledWith({
				where: filters,
			});
			expect(result).toEqual(mockCount);
		});

		it('should log and throw an error if count fails', async () => {
			const mockError = new Error('Database connection error');
			const filters = {};

			(mockPrisma.order.count as jest.Mock).mockRejectedValue(mockError);

			await expect(orderRepository.countAll(filters)).rejects.toThrow(
				mockError,
			);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in OrderRepository.getAllOrders:',
				mockError,
			);
		});
	});

	describe('createInTransaction', () => {
		it('should create a order', async () => {
			const customerId = 1;
			const totalOrderPrice = 25000;
			const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [
				{ product: { connect: { id: 1 } }, quantity: 2, price: 75 },
			];

			const mockOrder: Order = {
				id: 1,
				totalOrderPrice,
				customerId: customerId,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(mockTx.order.create as jest.Mock).mockResolvedValue(mockOrder);

			const result = await orderRepository.createInTransaction(
				mockTx,
				customerId,
				totalOrderPrice,
				orderItemsData,
			);

			expect(mockTx.order.create).toHaveBeenCalledWith({
				data: {
					customer: { connect: { id: customerId } },
					totalOrderPrice,
					orderItems: {
						create: orderItemsData,
					},
				},
			});
			expect(result).toEqual(mockOrder);
		});

		it('should throw an error when the order creation fails', async () => {
			const customerId = 1;
			const totalOrderPrice = 150;
			const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [
				{ product: { connect: { id: 1 } }, quantity: 2, price: 75 },
			];

			const mockError = new Error('Database error');
			(mockTx.order.create as jest.Mock).mockRejectedValue(mockError);

			await expect(
				orderRepository.createInTransaction(
					mockTx,
					customerId,
					totalOrderPrice,
					orderItemsData,
				),
			).rejects.toThrow(mockError);

			expect(logger.error).toHaveBeenCalledWith(
				'Error in OrderRepository.createInTransaction:',
				mockError,
			);
			expect(mockTx.order.create).toHaveBeenCalledWith({
				data: {
					customer: { connect: { id: customerId } },
					totalOrderPrice,
					orderItems: {
						create: orderItemsData,
					},
				},
			});
		});
	});
});
