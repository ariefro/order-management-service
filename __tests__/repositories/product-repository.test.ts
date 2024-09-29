import { ProductRepository } from '../../src/repositories/product-repository';
import { PrismaClient, Product } from '@prisma/client';
import logger from '../../src/configs/logger';

// Mock PrismaClient and logger
jest.mock('@prisma/client');
jest.mock('../../src/configs/logger');

describe('ProductRepository', () => {
	let mockPrisma: PrismaClient;
	let productRepository: ProductRepository;

	beforeEach(() => {
		// Mock PrismaClient instance
		mockPrisma = {
			product: {
				findMany: jest.fn(),
				findUnique: jest.fn(),
			},
		} as unknown as PrismaClient;

		// Initialize the repository with the mocked PrismaClient
		productRepository = new ProductRepository(mockPrisma);
	});

	afterEach(() => {
		jest.clearAllMocks(); // Clear mocks after each test
	});

	describe('findAll', () => {
		it('should return a list of products successfully', async () => {
			const mockProducts: Product[] = [
				{
					id: 1,
					name: 'Product 1',
					price: 100,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: 2,
					name: 'Product 2',
					price: 200,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			(mockPrisma.product.findMany as jest.Mock).mockResolvedValue(
				mockProducts,
			);

			const result = await productRepository.findAll();

			expect(mockPrisma.product.findMany).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockProducts);
		});

		it('should log and throw an error if findAll fails', async () => {
			const mockError = new Error('Database connection error');
			(mockPrisma.product.findMany as jest.Mock).mockRejectedValue(
				mockError,
			);

			await expect(productRepository.findAll()).rejects.toThrow(
				mockError,
			);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in ProductRepository.findAll: ',
				mockError,
			);
		});
	});

	describe('findById', () => {
		it('should return a product by id successfully', async () => {
			const mockProduct: Product = {
				id: 1,
				name: 'Product 1',
				price: 100,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(
				mockProduct,
			);

			const result = await productRepository.findById(1);

			expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
				where: { id: 1 },
			});
			expect(result).toEqual(mockProduct);
		});

		it('should return null if no product is found', async () => {
			(mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(
				null,
			);

			const result = await productRepository.findById(999);

			expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
				where: { id: 999 },
			});
			expect(result).toBeNull();
		});

		it('should log and throw an error if findById fails', async () => {
			const mockError = new Error('Database connection error');
			(mockPrisma.product.findUnique as jest.Mock).mockRejectedValue(
				mockError,
			);

			await expect(productRepository.findById(1)).rejects.toThrow(
				mockError,
			);
			expect(logger.error).toHaveBeenCalledWith(
				'Error in ProductRepository.findById: ',
				mockError,
			);
		});
	});
});
