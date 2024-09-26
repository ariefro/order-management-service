import { Product } from '@prisma/client';
import logger from '../config/logger';
import prisma from '../../prisma/client';

interface PaginatioParams {
	offset: number;
	limit: number;
}

export class ProductService {
	async getAllProducts({ offset, limit }: PaginatioParams): Promise<{
		products: Product[];
		totalItems: number;
	}> {
		try {
			const totalItems = await prisma.product.count();
			const products = await prisma.product.findMany({
				skip: offset,
				take: limit,
			});

			return { products, totalItems };
		} catch (error) {
			logger.error('Error in ProductService.getAllProducts: ', error);
			throw error;
		}
	}

	async getProductById(id: number) {
		try {
			const product = await prisma.product.findUnique({ where: { id } });

			return product;
		} catch (error) {
			logger.error('Error in ProductService.getProductById: ', error);
			throw error;
		}
	}
}
