import { Product } from '@prisma/client';
import logger from '../configs/logger';
import { ProductRepository } from '../repositories/product-repository';
import { NotFoundError } from '../errors';

export class ProductService {
	private productRepository: ProductRepository;

	constructor(productRepository: ProductRepository) {
		this.productRepository = productRepository;
	}

	public async getAllProducts(): Promise<Product[]> {
		try {
			return await this.productRepository.findAll();
		} catch (error) {
			logger.error('Error in ProductService.getAllProducts: ', error);
			throw error;
		}
	}

	public async getProductById(id: number): Promise<Product | null> {
		try {
			const product = await this.productRepository.findById(id);

			if (!product) {
				throw new NotFoundError(`Product with ID ${id} not found`);
			}

			return product;
		} catch (error) {
			logger.error('Error in ProductService.getProductById: ', error);
			throw error;
		}
	}

	public async createProduct(name: string, price: number): Promise<Product> {
		try {
			return await this.productRepository.createOne(name, price);
		} catch (error) {
			logger.error('Error in ProductService.createProduct: ', error);
			throw error;
		}
	}

	public async updateProduct(
		id: number,
		name: string,
		price: number,
	): Promise<Product> {
		try {
			const product = await this.productRepository.findById(id);

			if (!product) {
				throw new NotFoundError(`Product with ID ${id} not found`);
			}

			return await this.productRepository.updateOne(id, name, price);
		} catch (error) {
			logger.error('Error in ProductService.updateProduct: ', error);
			throw error;
		}
	}

	public async deleteProduct(id: number): Promise<Product> {
		try {
			const product = await this.productRepository.findById(id);

			if (!product) {
				throw new NotFoundError(`Product with ID ${id} not found`);
			}

			return await this.productRepository.deleteOne(id);
		} catch (error) {
			logger.error('Error in ProductService.deleteProduct: ', error);
			throw error;
		}
	}
}
