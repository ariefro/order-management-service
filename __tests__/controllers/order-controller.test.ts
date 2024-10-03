import { Request, Response, NextFunction } from 'express';
import { OrderController } from '../../src/controllers/order-controller';
import { OrderService } from '../../src/services/order-service';
import { successResponse } from '../../src/utils/success-response';
import { PrismaClient } from '@prisma/client';
import {
	CustomerRepository,
	OrderItemRepository,
	OrderRepository,
	ProductRepository,
} from '../../src/repositories';
import { statusCreated } from '../../src/constants/http-status-code';
import { ValidationError } from '../../src/errors';

jest.mock('../../src/services/order-service');
jest.mock('../../src/utils/success-response');

describe('OrderController', () => {
	let orderController: OrderController;
	let orderService: jest.Mocked<OrderService>;
	let mockPrisma: jest.Mocked<PrismaClient>;
	let mockOrderRepository: jest.Mocked<OrderRepository>;
	let mockCustomerRepository: jest.Mocked<CustomerRepository>;
	let mockOrderItemRepository: jest.Mocked<OrderItemRepository>;
	let mockProductRepository: jest.Mocked<ProductRepository>;
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;

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
		) as jest.Mocked<OrderService>;
		orderController = new OrderController(orderService);

		mockReq = {
			query: {},
		};
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		mockNext = jest.fn();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getOrders', () => {
		it('should call OrderService.getAllOrders with default pagination if no query params are provided', async () => {
			const mockOrders = { orders: [], totalItems: 0 };
			orderService.getAllOrders.mockResolvedValueOnce(mockOrders);

			await orderController.getOrders(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(orderService.getAllOrders).toHaveBeenCalledWith({
				limit: 10,
				offset: 0,
				customerName: undefined,
				orderDate: undefined,
			});

			expect(successResponse).toHaveBeenCalledWith(
				mockRes,
				{ orders: [] },
				'Orders fetched successfully',
				{
					totalItems: 0,
					totalPages: 0,
					currentPage: 1,
					pageSize: 10,
				},
			);
		});

		it('should call OrderService.getAllOrders with query params if provided', async () => {
			mockReq.query = {
				page: '1',
				limit: '5',
			};
			const mockOrders = {
				orders: [
					{
						id: 1,
						name: 'Order 1',
						totalOrderPrice: 20000,
						createdAt: new Date('2024-10-03'),
						updatedAt: new Date('2024-10-03'),
						customerId: 1,
					},
				],
				totalItems: 1,
			};
			orderService.getAllOrders.mockResolvedValueOnce(mockOrders);

			await orderController.getOrders(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(orderService.getAllOrders).toHaveBeenCalledWith({
				limit: 5,
				offset: 0,
			});

			expect(successResponse).toHaveBeenCalledWith(
				mockRes,
				{
					orders: [
						{
							id: 1,
							name: 'Order 1',
							totalOrderPrice: 20000,
							createdAt: new Date('2024-10-03'),
							updatedAt: new Date('2024-10-03'),
							customerId: 1,
						},
					],
				},
				'Orders fetched successfully',
				{
					totalItems: 1,
					totalPages: 1,
					currentPage: 1,
					pageSize: 5,
				},
			);
		});

		it('should call mockNext with an error if OrderService.getAllOrders throws an error', async () => {
			const mockError = new Error('An unexpected error occurred');
			orderService.getAllOrders.mockRejectedValueOnce(mockError);

			await orderController.getOrders(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(successResponse).not.toHaveBeenCalled();
		});
	});

	describe('createOrder', () => {
		it('should successfully create an order and send response', async () => {
			mockReq.body = {
				customerName: 'John Doe',
				orderItems: [{ productId: 1, quantity: 2 }],
			};

			const mockOrder = {
				id: 1,
				customerName: 'John Doe',
				totalPrice: 1000,
			};
			orderService.createOrder.mockResolvedValueOnce(mockOrder as any);

			await orderController.createOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(orderService.createOrder).toHaveBeenCalledWith('John Doe', [
				{ productId: 1, quantity: 2 },
			]);
			expect(successResponse).toHaveBeenCalledWith(
				mockRes,
				{ order: mockOrder },
				'Order created successfully',
				undefined,
				statusCreated,
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should throw a validation error if order are invalid', async () => {
			mockReq.body = {
				customerName: 'John Doe',
				orderItems: [],
			};
			const mockError = new Error('Order must have at least one product');
			orderService.createOrder.mockRejectedValueOnce(mockError);

			await orderController.createOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(orderService.createOrder).not.toHaveBeenCalled();
		});

		it('should throw a validation error if customer name are invalid', async () => {
			mockReq.body = {
				customerName: '',
				orderItems: [{ productId: 1, quantity: 1 }],
			};
			const mockError = new Error('Customer name is required');
			orderService.createOrder.mockRejectedValueOnce(mockError);

			await orderController.createOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(orderService.createOrder).not.toHaveBeenCalled();
		});

		it('should call mockNext with error if order items invalid', async () => {
			mockReq.body = {
				customerName: 'John Doe',
				orderItems: [{ productId: 1, quantity: 0 }],
			};

			const mockError = new Error(
				'Quantity is required and must be greater than 0',
			);
			orderService.createOrder.mockRejectedValueOnce(mockError);

			await orderController.createOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(orderService.createOrder).not.toHaveBeenCalledWith(
				mockError,
			);
			expect(successResponse).not.toHaveBeenCalled();
		});

		it('should call mockNext with error if order items with invalid product', async () => {
			mockReq.body = {
				customerName: 'John Doe',
				orderItems: [{ quantity: 1 }],
			};

			const mockError = new Error('Invalid product ID');
			orderService.createOrder.mockRejectedValueOnce(mockError);

			await orderController.createOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(orderService.createOrder).not.toHaveBeenCalledWith(
				mockError,
			);
			expect(successResponse).not.toHaveBeenCalled();
		});
	});

	describe('getOrderDetail', () => {
		it('should successfully fetch the order detail and send response', async () => {
			mockReq.params = { id: '1' };

			const mockOrder = {
				id: 1,
				customerName: 'John Doe',
				totalPrice: 10000,
			};
			orderService.getOrderById.mockResolvedValueOnce(mockOrder as any);

			await orderController.getOrderDetail(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(orderService.getOrderById).toHaveBeenCalledWith(1);
			expect(successResponse).toHaveBeenCalledWith(
				mockRes,
				{ order: mockOrder },
				'Order fetched successfully',
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should throw a validation error if order ID is invalid', async () => {
			mockReq.params = { id: '0' };
			const mockError = new Error('Invalid order ID');

			await orderController.getOrderDetail(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(orderService.getOrderById).not.toHaveBeenCalled();
		});

		it('should call mockNext with error if orderService.getOrderById throws an error', async () => {
			mockReq.params = { id: '1' };

			const mockError = new Error('Order not found');
			orderService.getOrderById.mockRejectedValueOnce(mockError);

			await orderController.getOrderDetail(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(orderService.getOrderById).toHaveBeenCalledWith(1);
			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(successResponse).not.toHaveBeenCalled();
		});
	});

	describe('OrderController - editOrder', () => {
		it('should successfully edit the order and send response', async () => {
			mockReq.params = { id: '1' };
			mockReq.body = { orderItems: [{ productId: 1, quantity: 2 }] };

			const mockOrder = {
				id: 1,
				orderItems: [{ productId: 1, quantity: 2 }],
			};
			orderService.editOrderById.mockResolvedValueOnce(mockOrder as any);

			await orderController.editOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(orderService.editOrderById).toHaveBeenCalledWith(
				1,
				mockReq.body.orderItems,
			);
			expect(successResponse).toHaveBeenCalledWith(
				mockRes,
				{ order: mockOrder },
				'Order updated successfully',
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should throw a validation error if order ID is invalid', async () => {
			mockReq.params = { id: '0' };
			const mockError = new Error('Invalid order ID');

			await orderController.editOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(orderService.editOrderById).not.toHaveBeenCalled();
		});

		it('should throw a validation error if orderItems is missing or invalid', async () => {
			mockReq.params = { id: '1' };
			mockReq.body = { orderItems: null };

			jest.spyOn(
				orderController as any,
				'validateOrderItems',
			).mockImplementation(() => {
				throw new ValidationError('Invalid order items');
			});

			await orderController.editOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
			expect(orderService.editOrderById).not.toHaveBeenCalled();
		});

		it('should call mockNext with error if orderService.editOrderById throws an error', async () => {
			mockReq.params = { id: '1' };
			mockReq.body = { orderItems: [{ productId: 1, quantity: 2 }] };

			const mockError = new Error('An unexpected error occurred');
			orderService.editOrderById.mockRejectedValueOnce(mockError);

			await orderController.editOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(orderService.editOrderById).toHaveBeenCalledWith(
				1,
				mockReq.body.orderItems,
			);
			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(successResponse).not.toHaveBeenCalled();
		});
	});

	describe('deleteOrder', () => {
		it('should successfully delete the order and send response', async () => {
			mockReq.params = { id: '1' };

			orderService.deleteOrderById.mockResolvedValueOnce(true);

			await orderController.deleteOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(orderService.deleteOrderById).toHaveBeenCalledWith(1);
			expect(successResponse).toHaveBeenCalledWith(
				mockRes,
				undefined,
				'Successfully deleted order',
			);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should throw a validation error if order ID is invalid', async () => {
			mockReq.params = { id: 'abc' };
			const mockError = new Error('Invalid order ID');

			await orderController.deleteOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(orderService.deleteOrderById).not.toHaveBeenCalled();
			expect(successResponse).not.toHaveBeenCalled();
		});

		it('should call mockNext with error if orderService.deleteOrderById throws an error', async () => {
			mockReq.params = { id: '1' };

			const mockError = new Error('An unexpected error occured');
			orderService.deleteOrderById.mockRejectedValueOnce(mockError);

			await orderController.deleteOrder(
				mockReq as Request,
				mockRes as Response,
				mockNext as NextFunction,
			);

			expect(orderService.deleteOrderById).toHaveBeenCalledWith(1);
			expect(mockNext).toHaveBeenCalledWith(mockError);
			expect(successResponse).not.toHaveBeenCalled();
		});
	});
});
