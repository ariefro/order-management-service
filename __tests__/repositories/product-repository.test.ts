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
				create: jest.fn(),
				update: jest.fn(),
				delete: jest.fn(),
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

	describe('createOne', () => {
		it('should create and return a product successfully', async () => {
			const mockProduct: Product = {
				id: 1,
				name: 'New Product',
				price: 100,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			(mockPrisma.product.create as jest.Mock).mockResolvedValue(
				mockProduct,
			);

			const result = await productRepository.createOne(
				'New Product',
				100,
			);

			expect(mockPrisma.product.create).toHaveBeenCalledWith({
				data: { name: 'New Product', price: 100 },
			});
			expect(result).toEqual(mockProduct);
		});

		it('should log and throw an error if create fails', async () => {
			const mockError = new Error('Database connection error');

			(mockPrisma.product.create as jest.Mock).mockRejectedValue(
				mockError,
			);

			await expect(
				productRepository.createOne('New Product', 100),
			).rejects.toThrow(mockError);

			expect(logger.error).toHaveBeenCalledWith(
				'Error in ProductRepository.createOne: ',
				mockError,
			);
		});
	});

	it('should update a product successfully', async () => {
		const productId = 1;
		const updatedProductData: Product = {
			id: productId,
			name: 'Updated Product',
			price: 150,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		(mockPrisma.product.update as jest.Mock).mockResolvedValue(
			updatedProductData,
		);

		const result = await productRepository.updateOne(
			productId,
			'Updated Product',
			150,
		);

		expect(mockPrisma.product.update).toHaveBeenCalledTimes(1);
		expect(mockPrisma.product.update).toHaveBeenCalledWith({
			where: { id: productId },
			data: { name: 'Updated Product', price: 150 },
		});
		expect(result).toEqual(updatedProductData);
	});

	it('should log and throw an error if update fails', async () => {
		const productId = 1;
		const mockError = new Error('Database update error');

		(mockPrisma.product.update as jest.Mock).mockRejectedValue(mockError);

		await expect(
			productRepository.updateOne(productId, 'Updated Product', 150),
		).rejects.toThrow(mockError);

		expect(logger.error).toHaveBeenCalledWith(
			'Error in ProductRepository.updateOne: ',
			mockError,
		);
	});

	it('should delete a product successfully', async () => {
		const productId = 1;
		const mockDeletedProduct: Product = {
			id: productId,
			name: 'Deleted Product',
			price: 100,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		(mockPrisma.product.delete as jest.Mock).mockResolvedValue(
			mockDeletedProduct,
		);

		const result = await productRepository.deleteOne(productId);

		expect(mockPrisma.product.delete).toHaveBeenCalledTimes(1);
		expect(mockPrisma.product.delete).toHaveBeenCalledWith({
			where: { id: productId },
		});
		expect(result).toEqual(mockDeletedProduct);
	});

	it('should log and throw an error if delete fails', async () => {
		const productId = 1;
		const mockError = new Error('Database delete error');

		(mockPrisma.product.delete as jest.Mock).mockRejectedValue(mockError);

		await expect(productRepository.deleteOne(productId)).rejects.toThrow(
			mockError,
		);

		expect(logger.error).toHaveBeenCalledWith(
			'Error in ProductRepository.deleteOne: ',
			mockError,
		);
	});
});
