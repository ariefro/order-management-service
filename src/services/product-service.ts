import { PrismaClient, Product } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

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
			logger.error('Error in ProductService.getAllProducts:', error);
			throw error;
		}
	}
}
