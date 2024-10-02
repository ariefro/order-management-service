import { Request, Response, NextFunction } from 'express';
import { ProductController } from '../../src/controllers/product-controller';
import { ProductService } from '../../src/services/product-service';
import { successResponse } from '../../src/utils/success-response';
import { ProductRepository } from '../../src/repositories';
import { PrismaClient, Product } from '@prisma/client';

jest.mock('@prisma/client');
jest.mock('../../src/services/product-service');
jest.mock('../../src/utils/success-response');

describe('ProductController', () => {
	let mockReq: Partial<Request>;
	let mockRes: Partial<Response>;
	let mockNext: NextFunction;
	let mockPrisma: jest.Mocked<PrismaClient>;
	let mockProductRepository: jest.Mocked<ProductRepository>;
	let productController: ProductController;
	let productService: jest.Mocked<ProductService>;

	beforeEach(() => {
		// Mock instances and dependencies
		mockProductRepository = new ProductRepository(
			mockPrisma,
		) as jest.Mocked<ProductRepository>;
		productService = new ProductService(
			mockProductRepository,
		) as jest.Mocked<ProductService>;
		productController = new ProductController(productService);

		// Mock req, res, next
		mockReq = {};
		mockRes = {};
		mockNext = jest.fn();
	});

	const mockProducts: Product[] = [
		{
			id: 1,
			name: 'Product A',
			price: 1000,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: 2,
			name: 'Product B',
			price: 2000,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	describe('getAllProducts', () => {
		it('should fetch all products and return success response', async () => {
			productService.getAllProducts.mockResolvedValue(mockProducts);

			await productController.getAllProducts(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(productService.getAllProducts).toHaveBeenCalledTimes(1);

			expect(successResponse).toHaveBeenCalledWith(
				mockRes,
				{ products: mockProducts },
				'Products fetched successfully',
			);
		});

		it('should call next with error when service throws an error', async () => {
			const mockError = new Error('An unexpected error occurred');
			productService.getAllProducts.mockRejectedValue(mockError);

			await productController.getAllProducts(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
		});
	});
});
