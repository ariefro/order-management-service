import { Product } from '@prisma/client';
import logger from '../config/logger';
import { ProductRepository } from '../repositories/product-repository';
import { NotFoundError } from '../errors';

export class ProductService {
	private productRepository: ProductRepository;

	constructor() {
		this.productRepository = new ProductRepository();
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
}
