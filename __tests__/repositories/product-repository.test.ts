import { ProductRepository } from '../../src/repositories/product-repository';
import { PrismaClient, Product } from '@prisma/client';
import logger from '../../src/configs/logger';

// Mock PrismaClient and logger
jest.mock('@prisma/client');
jest.mock('../../src/configs/logger');

describe('Product Repository', () => {
	let mockPrisma: PrismaClient;
	let productRepository: ProductRepository;

	beforeEach(() => {
		// Mock PrismaClient instance
		mockPrisma = {
			product: {
				findMany: jest.fn(),
			},
		} as unknown as PrismaClient;

		// Initialize the repository with the mocked PrismaClient
		productRepository = new ProductRepository(mockPrisma);
	});

	afterEach(() => {
		jest.clearAllMocks(); // Clear mocks after each test
	});

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
		(mockPrisma.product.findMany as jest.Mock).mockRejectedValue(mockError);

		await expect(productRepository.findAll()).rejects.toThrow(mockError);
		expect(logger.error).toHaveBeenCalledWith(
			'Error in ProductRepository.findAll: ',
			mockError,
		);
	});
});
