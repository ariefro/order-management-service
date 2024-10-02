import { ProductService } from '../../src/services/product-service';
import { ProductRepository } from '../../src/repositories/product-repository';
import { PrismaClient, Product } from '@prisma/client';
import logger from '../../src/configs/logger';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('../../src/repositories/product-repository');
jest.mock('../../src/configs/logger');

describe('ProductService', () => {
	let mockPrisma: jest.Mocked<PrismaClient>;
	let productService: ProductService;
	let productRepository: jest.Mocked<ProductRepository>;

	beforeEach(() => {
		productRepository = new ProductRepository(
			mockPrisma,
		) as jest.Mocked<ProductRepository>;
		productService = new ProductService(productRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const mockProduct: Product = {
		id: 1,
		name: 'Product A',
		price: 1000,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	describe('getAllProducts', () => {
		it('should return a list of products successfully', async () => {
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
			productRepository.findAll.mockResolvedValue(mockProducts);

			const result = await productService.getAllProducts();

			expect(result).toEqual(mockProducts);
			expect(productRepository.findAll).toHaveBeenCalledTimes(1);
		});

		it('should throw an error if findAll fails', async () => {
			const errorMessage = 'An unexpected error occurred';
			productRepository.findAll.mockRejectedValue(
				new Error(errorMessage),
			);

			await expect(productService.getAllProducts()).rejects.toThrow(
				errorMessage,
			);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in ProductService.getAllProducts: ',
				expect.any(Error),
			);
			expect(productRepository.findAll).toHaveBeenCalledTimes(1);
		});
	});

	describe('getProductById', () => {
		it('should return a product if found', async () => {
			productRepository.findById.mockResolvedValue(mockProduct);

			const result = await productService.getProductById(1);

			expect(result).toEqual(mockProduct);
			expect(productRepository.findById).toHaveBeenCalledWith(1);
			expect(productRepository.findById).toHaveBeenCalledTimes(1);
		});

		it('should throw NotFoundError if product is not found', async () => {
			productRepository.findById.mockResolvedValue(null);

			await expect(productService.getProductById(1)).rejects.toThrow(
				`Product with ID 1 not found`,
			);
			expect(productRepository.findById).toHaveBeenCalledWith(1);
			expect(productRepository.findById).toHaveBeenCalledTimes(1);
		});

		it('should log and throw an error if repository throws an error', async () => {
			const errorMessage = 'An unexpected error occurred';
			productRepository.findById.mockRejectedValue(
				new Error(errorMessage),
			);

			await expect(productService.getProductById(1)).rejects.toThrow(
				errorMessage,
			);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in ProductService.getProductById: ',
				expect.any(Error),
			);

			expect(productRepository.findById).toHaveBeenCalledWith(1);
			expect(productRepository.findById).toHaveBeenCalledTimes(1);
		});
	});

	describe('createProduct', () => {
		it('should create a product successfully', async () => {
			productRepository.createOne.mockResolvedValue(mockProduct);

			const result = await productService.createProduct(
				'Product A',
				1000,
			);

			expect(result).toEqual(mockProduct);
			expect(productRepository.createOne).toHaveBeenCalledWith(
				'Product A',
				1000,
			);
			expect(productRepository.createOne).toHaveBeenCalledTimes(1);
		});

		it('should log and rethrow an error if product creation fails', async () => {
			const errorMessage = 'An unexpected error occurred';
			productRepository.createOne.mockRejectedValue(
				new Error(errorMessage),
			);

			await expect(
				productService.createProduct('Product A', 1000),
			).rejects.toThrow(errorMessage);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in ProductService.createProduct: ',
				expect.any(Error),
			);
		});
	});

	describe('updateProduct', () => {
		it('should update a product successfully if it exists', async () => {
			const mockProduct: Product = {
				id: 1,
				name: 'Updated Product',
				price: 2000,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			productRepository.findById.mockResolvedValue(mockProduct);
			productRepository.updateOne.mockResolvedValue(mockProduct);

			const result = await productService.updateProduct(
				1,
				'Updated Product',
				2000,
			);

			expect(result).toEqual(mockProduct);
			expect(productRepository.findById).toHaveBeenCalledWith(1);
			expect(productRepository.updateOne).toHaveBeenCalledWith(
				1,
				'Updated Product',
				2000,
			);
			expect(productRepository.updateOne).toHaveBeenCalledTimes(1);
		});

		it('should throw NotFoundError if the product does not exist', async () => {
			productRepository.findById.mockResolvedValue(null);

			await expect(
				productService.updateProduct(1, 'Product B', 2000),
			).rejects.toThrow(`Product with ID 1 not found`);
			expect(productRepository.findById).toHaveBeenCalledWith(1);
			expect(productRepository.updateOne).not.toHaveBeenCalled();
		});

		it('should log and rethrow an error if product update fails', async () => {
			const errorMessage = 'An unexpected error occurred';
			productRepository.findById.mockResolvedValue(mockProduct);
			productRepository.updateOne.mockRejectedValue(
				new Error(errorMessage),
			);

			await expect(
				productService.updateProduct(1, 'Updated Product', 2000),
			).rejects.toThrow(errorMessage);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in ProductService.updateProduct: ',
				expect.any(Error),
			);
		});
	});

	describe('deleteProduct', () => {
		it('should delete a product successfully if it exists', async () => {
			productRepository.findById.mockResolvedValue(mockProduct);
			productRepository.deleteOne.mockResolvedValue(mockProduct);

			const result = await productService.deleteProduct(1);

			expect(result).toEqual(mockProduct);
			expect(productRepository.findById).toHaveBeenCalledWith(1);
			expect(productRepository.deleteOne).toHaveBeenCalledWith(1);
			expect(productRepository.deleteOne).toHaveBeenCalledTimes(1);
		});

		it('should throw NotFoundError if the product does not exist', async () => {
			productRepository.findById.mockResolvedValue(null);

			await expect(productService.deleteProduct(1)).rejects.toThrow(
				`Product with ID 1 not found`,
			);
			expect(productRepository.findById).toHaveBeenCalledWith(1);
			expect(productRepository.deleteOne).not.toHaveBeenCalled();
		});

		it('should log and rethrow an error if product deletion fails', async () => {
			const errorMessage = 'An unexpected error occurred';
			productRepository.findById.mockResolvedValue(mockProduct);
			productRepository.deleteOne.mockRejectedValue(
				new Error(errorMessage),
			);

			await expect(productService.deleteProduct(1)).rejects.toThrow(
				errorMessage,
			);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in ProductService.deleteProduct: ',
				expect.any(Error),
			);
		});
	});
});
