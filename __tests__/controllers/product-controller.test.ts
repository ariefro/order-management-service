import { Request, Response, NextFunction } from 'express';
import { ProductController } from '../../src/controllers/product-controller';
import { ProductService } from '../../src/services/product-service';
import { successResponse } from '../../src/utils/success-response';
import { ProductRepository } from '../../src/repositories';
import { PrismaClient, Product } from '@prisma/client';
import { NotFoundError, ValidationError } from '../../src/errors';
import { statusCreated } from '../../src/constants/http-status-code';

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
		mockReq = {
			params: {},
		};
		mockRes = {};
		mockNext = jest.fn();
	});

	const mockProduct: Product = {
		id: 1,
		name: 'Product 1',
		price: 100,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

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

	describe('getProductById', () => {
		it('should throw a ValidationError if the product ID is invalid', async () => {
			mockReq.params!.id = 'abc'; // Non-numeric value

			await productController.getProductById(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
		});

		it('should throw a ValidationError if the product ID is less than or equal to 0', async () => {
			mockReq.params!.id = '-1';

			await productController.getProductById(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
		});

		it('should call ProductService.getProductById and return product data if valid ID is passed', async () => {
			mockReq.params!.id = '1';
			productService.getProductById.mockResolvedValue(mockProduct);

			await productController.getProductById(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			// Assert: Ensure ProductService.getProductById was called with correct ID
			expect(productService.getProductById).toHaveBeenCalledWith(1);

			expect(successResponse).toHaveBeenCalledWith(
				mockRes,
				{ product: mockProduct },
				'Product fetched successfully',
			);
		});

		it('should call next with error if product is not found', async () => {
			mockReq.params!.id = '1';
			const notFoundError = new NotFoundError('Product not found');
			productService.getProductById.mockRejectedValue(notFoundError);

			await productController.getProductById(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(notFoundError);
		});

		it('should call next with any unexpected error', async () => {
			mockReq.params!.id = '1';
			const mockError = new Error('An unexpected error occurred');
			productService.getProductById.mockRejectedValue(mockError);

			await productController.getProductById(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
		});
	});

	describe('createProduct', () => {
		it('should throw a ValidationError if name or price is invalid', async () => {
			mockReq.body = { name: 'abc', price: '-1000' };
			const invalidRequestParameter = new ValidationError(
				'Invalid request parameter',
			);

			await productController.createProduct(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(invalidRequestParameter);
		});

		it('should throw a ValidationError if name or price is empty', async () => {
			mockReq.body = { name: '', price: '-1000' };
			const invalidRequestParameter = new ValidationError(
				'Please fill all of mandatory field',
			);

			await productController.createProduct(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(invalidRequestParameter);
		});

		it('should call ProductService.createProduct and return the newly created product', async () => {
			mockReq.body = { name: 'Product A', price: '1000' }; // Simulate valid input
			productService.createProduct.mockResolvedValue(mockProduct);

			await productController.createProduct(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(productService.createProduct).toHaveBeenCalledWith(
				'Product A',
				1000,
			);

			expect(successResponse).toHaveBeenCalledWith(
				mockRes,
				{ product: mockProduct },
				'Product created successfully',
				undefined,
				statusCreated,
			);
		});

		it('should call next with error if an exception occurs in ProductService', async () => {
			mockReq.body = { name: 'Product A', price: '1000' };
			const mockError = new Error('An unexpected error occurred');
			productService.createProduct.mockRejectedValue(mockError);

			await productController.createProduct(
				mockReq as Request,
				mockRes as Response,
				mockNext,
			);

			expect(mockNext).toHaveBeenCalledWith(mockError);
		});
	});
});
